const maxrow = 6;
const maxcol = 5;
const pixPerCol = 101;
const pixPerRow = 83;
// Gems are like cookies

const GemsData = {
    Green: {
        lifeTime: 3,
        lives: 4
    },
    Orange: {
        lifeTime: 5,
        lives: 2
    },
    Blue: {
        lifeTime: 4,
        lives: 3
    }
};

let allEnemies = [];
let gem = null; // we will show max 1 gem
let player = null;
// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/trimmed-enemy-bug.png';

    // Enemy can move only horizontally and will belong to a particular row.
    // They can go up and down by changing row number
    // They will have horizontal position based on motion.

    this.row = 2 + Math.floor(Math.random() * 3); // top three rows only. pick randomly

    this.x = 0;
    // choose speed randomly
    this.speed = 20 + Math.random() * 20 * 7; // 20 to 160 pixel per second
    this.lasts = 0;
    this.canvas = document.getElementsByTagName("canvas")[0];

};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += dt * this.speed; // dt is in milliseconds
    // if it is  out of bounds -
    if (this.x > this.canvas.width) {
        // change row randomly
        this.row = Math.floor(Math.random() * 3) + 2;
        // change speed randomly
        this.speed = 20 + Math.random() * 20 * 7; // 20 to 160 pixel per second
        this.x = 0;
    }

    // each row is 83 pixel high. this will give y coordinate
    this.y = this.row * pixPerRow - this.height / 2;

};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
function Player() {


    this.sprite = 'images/trimmed-char-boy.png';
    // player start in middle at bottom
    this.row = 5;
    this.col = 2;

    // maintain score
    this.crashes = 0;
    this.lives = 4; // we start with 4 lives

    //maintain position
    this.x = 0;
    this.y = 0;

    // start a timer
    this.timer = new Timer();
    this.timer.start();
    // show scores
    this.scoreDiv = document.createElement('div'),
    this.scoreDiv.style.height = '100px';
    this.scoreDiv.style.width = '505px';
    // maintain timer and lives - updated in update cb
    this.scoreDiv.innerHTML = '<div id="timer" class="timer">00:00:00</div><div id="score" class="score">crashes</div><div class="score"><a class="reset1" id="reset" href="#" >Restart</a></div>';
    document.body.appendChild(this.scoreDiv);
    this.timerHTML = document.getElementById('timer');
    this.scoreHTML = document.getElementById('score');
    this.resetHTML = document.getElementById('reset');
    var player = this;

    // handle restart button
    this.restart = function() {
        player.crashes = 0;
        player.lives = 4;
        player.restoreOrigin();
        player.timer.stop();
        player.timer.reset();

    }
    // allow player to restart the game
    this.resetHTML.addEventListener("click", this.restart);

    // Draw the player on the screen, required method for game
    this.render = function() {
        // console.log('Drawing ', this.x , ' ' , this.y);
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    //  Handle Arrow Keys for player

    this.handleInput = function(event) {
        // do not allow movement if no life is left
        if (this.lives <= 0)
            retun;
        // move in grid, check boundary conditions
        if (event == 'left') // go left
        {
            if (this.col > 0) {
                this.col--;
            }
        }
        if (event == 'right') // go right
        {
            if (this.col < maxcol - 1) {
                this.col++;
            }
        }
        if (event == 'down') // go down
        {
            if (this.row < maxrow - 1) {
                this.row++;
            }
        }
        if (event == 'up') // go up
        {
            if (this.row > 0) {
                this.row--;
            }
        }
        // we reached?
        if (this.row == 0) {
            this.showWin();
        }
    }


    // udate method for player
    this.update = function(dt) {

        this.x = this.col * pixPerCol + (pixPerCol - this.width) / 2;
        this.y = this.row * pixPerRow + pixPerRow / 2;

        //  console.log('moved to ', this.x , ' ' , this.y)
        // is it colliding with enemies
        // update timer
        this.timerHTML.innerText = this.timer.getTimeValues().toString();
        this.scoreHTML.innerText = this.lives + ' lives';

        // check collistion with Gems to increase the lives
        let lives = 0;
        if (lives = this.checkCollisionWithGem()) {
            this.lives += lives;
        }
        // check collition with Enemys to decrease the lives
        for (var i = 0; i < allEnemies.length; i++) {
            if (this.checkCollisionWithEnemy(allEnemies[i])) {
                this.restoreOrigin();
                this.crashes++;
                this.lives--;
                if (this.lives == 0) {
                    alert("You lost. You crashed  " + this.crashes + ' time/s');

                }
                console.log('Crashed with ', i);
                return;
            }
        }
        return;
    }

    // set the position of user to starting point
    this.restoreOrigin = function() {
        player.col = 2;
        player.row = 5;


    }
    // check if user crashed in enemy- overla of rectangles. We trimmed images to get this right
    this.checkCollisionWithEnemy = function(enemy) {
        var rect1 = enemy;
        var rect2 = this;
        //console.log('Enemy width ht',enemy.width , ' ', enemy.height);
        // console.log('Player width ht',this.width , ' ', this.height);
        if (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y) {

            return true
        } else
            return false;
    }

    // check if colliding with gem. just check row and column
    this.checkCollisionWithGem = function() {
        // player and gen on same square?
        if (gem && (gem.row == this.row && gem.col == this.col)) {

            let result = gem.lives;
            // delete gem
            gem = null;
            // clear end of life timer
            if (endOfLifeTimer) {
                clearTimeout(endOfLifeTimer);
                endOfLifeTimer = null;
            }
            return result;
        } else
            return 0;
    }
    // show Won dialog
    this.showWin = function() {
        var retVal = confirm("You made it. Your time was " +
            this.timer.getTimeValues().toString() +
            ". You are left with " +
            this.lives +
            " life/lives.\n Do you wish to play again?");
        if (retVal == true) {
            var player = this;
            this.restart();
        } else {
            this.timer.stop;
        }

    }
}
class Gem {
    // colliding with Gem gives more lives
    // orange - 2
    // blue - 3
    // green - 4
    constructor(color) {
        this.color = color;
        this.lives = GemsData[color].lives;
        this.row = 2; // all gems are in middle row
        this.col = Math.floor(Math.random() * 5); // random column
        this.sprite = 'images/Gem ' + color + '.png';
    }


    update(dt) {
        this.x = this.col * pixPerCol;
        this.y = this.row * pixPerRow;

    }

    render() {
        // console.log('Drawing ', this.x , ' ' , this.y);
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }


}

// test
// start interval timer to display and destroy Gems

let endOfLifeTimer = null;

// we need timer to show gems intermittently
setInterval(function() {
        const color = ['Green', 'Blue', 'Orange']
        if (!gem) {
            // do it only 1/3 rd of times
            if (Math.random() < 0.33) {
                // pick a random color
                let index = Math.floor(Math.random() * 3);


                gem = new Gem(color[index]);
                // and destroy gem timer
                endOfLifeTimer = setTimeout(function() {
                    gem = null;
                }, GemsData[color[index]].lifeTime * 1000);
            }
        }
    },
    2000
);

// test


// Place all enemy objects in an array called allEnemies
var initEnemies = function() {
    // start with 4 enemies. .
    for (let i = 0; i < 4; i++) {
        let enemy = new Enemy();
        // this needs to be done only after resource ready
        enemy.width = Resources.get(enemy.sprite).width;
        enemy.height = 70; //Resources.get(enemy.sprite).height/2; // only lower half
        allEnemies.push(enemy);

    }
}
var initPlayer = function() {
    // Place the player object in a variable called player
    player = new Player();
    // this needs to be done only after resource ready
    player.width = Resources.get(player.sprite).width;
    player.height = Resources.get(player.sprite).height;
    player.canvas = document.getElementsByTagName("canvas")[0];
    //   player.x=player.canvas.width/2 - 30;
    //    player.y=player.canvas.height - player.height;

};



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
Resources.onReady(initEnemies); // Now instantiate your objects.
Resources.onReady(initPlayer);
