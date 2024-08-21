// prevent arrow keys from scrolling
window.addEventListener("keydown", function(e) {
    if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

let gameArea = document.getElementById("gameArea");
let ctx = gameArea.getContext("2d");

const WIDTH = 500; // area of canvas
const HEIGHT = 500;
const maxMultiple = Math.floor((HEIGHT - 20) / 20) + 1;    // lines stuff up to a 20px "grid"

// variables
let speedControl = 3;
let eaten = true;
let intervalID;
let running = false; // check to see whether game is already running
ctx.strokeStyle = "#B3EEAA";  // background color for outlining snakes

// food object
let food = {
  width: 20,
  height: 20,
  color: "orange",
  list: [],    // if there needs to be more than 1
  draw: function() {
    //this.list.forEach(function(foodItem) {
    ctx.save();
    ctx.fillStyle = food.color;
    ctx.fillRect(this.list[0].x, this.list[0].y, food.height, food.width);
    ctx.strokeRect(this.list[0].x + 1, this.list[0].y + 1, 20 - 2, 20 - 2);
    ctx.fillStyle = "green";
    ctx.fillRect(this.list[0].x + 9, this.list[0].y, 7, 5);
    ctx.fillRect(this.list[0].x + 5, this.list[0].y - 2, 5, 7);
    ctx.fillStyle = "#f5d36c";
    ctx.fillRect(this.list[0].x + 3, this.list[0].y + 4, 5, 5);
    ctx.fillStyle = "#e09909";
    ctx.fillRect(this.list[0].x + 3, this.list[0].y + 18, 15, 2);
    ctx.restore();
  }
};

// Snake constructor
function Snake(bodyColor, eyeColor, score, bodyCoordinates) {
  this.width = 20;
  this.height = 20;
  this.bodyColor = bodyColor;
  this.eyeColor = eyeColor;
  this.speed = 20;
  this.score = score;
  this.body = bodyCoordinates;
  this.direction = 99;
  this.draw = function() {
    for (let i = 0; i < this.body.length; i++) {
      ctx.fillStyle = this.bodyColor;
      ctx.fillRect(this.body[i].x, this.body[i].y, 20, 20);
      ctx.strokeRect(this.body[i].x + 1, this.body[i].y + 1, 20 - 2, 20 - 2);
      if (i === 0) {
        ctx.save();
        ctx.fillStyle = this.eyeColor;
        ctx.translate(this.body[i].x + 10, this.body[i].y + 10);
        switch (this.direction) {
          case 0:
            ctx.rotate((3 * Math.PI) / 2);
            break;
          case 1:
            break;
          case 2:
            ctx.rotate(Math.PI / 2);
            break;
          case 3:
            ctx.rotate(Math.PI);
            break;
        }
        ctx.translate(-(this.body[i].x + 10), -(this.body[i].y + 10));
        ctx.fillRect(this.body[i].x + 2, this.body[i].y + 2, 6, 5);
        ctx.fillRect(this.body[i].x + 12, this.body[i].y + 2, 6, 5);
        ctx.restore();
      }
    }
  };
  
  // wrap around
  this.checkBoundary = function() {
    if (this.body[0].x > WIDTH) {
      this.body[0].x = 0;
    } 
    if (this.body[0].x < 0) {
      this.body[0].x = WIDTH;
    }
    if (this.body[0].y > HEIGHT) {
      this.body[0].y = 0;
    }
    if (this.body[0].y < 0) {
      this.body[0].y = HEIGHT;
    }
  };

  // set new body coordinates
  this.updatePosition = function() {
    // moves rest of body up by 1 block
    if (this.direction >= 0 && this.direction <= 3) {
      for (let i = this.body.length - 1; i > 0; i--) {
        this.body[i].x = this.body[i - 1].x;
        this.body[i].y = this.body[i - 1].y;
      }
    }
    // determine new head position based on key press
    switch (this.direction) {
      case 0:    // left
        this.body[0].x = this.body[0].x - this.speed;
        break;
      case 1:    // up
        this.body[0].y = this.body[0].y - this.speed;
        break;
      case 2:    // right
        this.body[0].x = this.body[0].x + this.speed;
        break;
      case 3:    // down
        this.body[0].y = this.body[0].y + this.speed;
        break;
    }
  };

  // add new block at the head
  this.grow = function() {
    this.score += 1;
    let newX, newY;
    switch (this.direction) {
      case 0:
        newX = this.body[0].x - 20;
        newY = this.body[0].y;
        break;
      case 1:
        newX = this.body[0].x;
        newY = this.body[0].y - 20;
        break;
      case 2:
        newX = this.body[0].x + 20;
        newY = this.body[0].y;
        break;
      case 3:
        newX = this.body[0].x;
        newY = this.body[0].y + 20;
        break;
    }
    this.body.unshift({ x: newX, y: newY });
  };
}

// Initialize the 2 snakes
let greenSnake = new Snake("#31cf2b", "red", 0, [
  { x: 100, y: 200 },
  { x: 100, y: 220 },
  { x: 100, y: 240 }
]);
let blueSnake = new Snake("#4287f5", "red", 0, [
  { x: 380, y: 200 },
  { x: 380, y: 220 },
  { x: 380, y: 240 }
]);

// game customizations
let p1color = document.querySelector("#p1color");
p1color.addEventListener("change", function() {
  greenSnake.bodyColor = String(this.value);
});

let p2color = document.querySelector("#p2color");
p2color.addEventListener("change", function() {
  blueSnake.bodyColor = String(this.value);
});

let p1eye = document.querySelector("#p1eye");
p1eye.addEventListener("change", function() {
  greenSnake.eyeColor = String(this.value);
});

let p2eye = document.querySelector("#p2eye");
p2eye.addEventListener("change", function() {
  blueSnake.eyeColor = String(this.value);
});

let speed = document.querySelector("#speed");
speed.addEventListener("change", function() {
  speedControl = this.value;
  if (running) {
    clearInterval(intervalID);
    running = false;
  }
  startGame();
});

// set canvas styles
ctx.font = "21px Arial";
ctx.textBaseline = "middle";
ctx.textAlign = "center";
ctx.fillStyle = "#316D46";
ctx.fillText("Click to start the game", WIDTH / 2, HEIGHT / 2);
ctx.lineWidth = 2;

document.getElementById("gameArea").onmousedown = function() {
  if (running) {
    clearInterval(intervalID);
    running = false;
  }
  startGame();
};

function startGame() {
  // set starting stats of snakes
  greenSnake.body = [{ x: 100, y: 200 }, { x: 100, y: 220 }, { x: 100, y: 240 }];
  blueSnake.body = [{ x: 380, y: 200 }, { x: 380, y: 220 }, { x: 380, y: 240 }];
  greenSnake.direction = 99;
  blueSnake.direction = 99;
  greenSnake.score = 0;
  blueSnake.score = 0;

  eaten = true;
  running = true;
  intervalID = setInterval(gameFrame, Number(speedControl) * 100);
}

// what the game does per frame
const gameFrame = function() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT); // clears canvas
  while (eaten) {
    // generate new food
    let randX = 20 * Math.floor(Math.random() * maxMultiple);
    let randY = 20 * Math.floor(Math.random() * maxMultiple);
    food.list[0] = { x: randX, y: randY };
    eaten = false;
  }
  food.draw();

  // draw snake
  greenSnake.draw();
  blueSnake.draw();

  // check if food is eaten
  if (collision(greenSnake.body[0], food.list[0])) {
    food.list = [];
    eaten = true;
    greenSnake.grow();
  } 
  if (collision(blueSnake.body[0], food.list[0])) {
    food.list = [];
    eaten = true;
    blueSnake.grow();
  }

  ctx.save();
  ctx.fillStyle = greenSnake.bodyColor;
  ctx.fillText("P1 Score: " + greenSnake.score, 420, 30);
  ctx.fillStyle = blueSnake.bodyColor;
  ctx.fillText("P2 Score: " + blueSnake.score, 420, 50);
  ctx.restore();
  
  checkGameOver(greenSnake, blueSnake);
  greenSnake.checkBoundary();
  blueSnake.checkBoundary();
  greenSnake.updatePosition();
  blueSnake.updatePosition();
};

function collision(source, target) {
  return (Math.abs(source.x - target.x) < 20 && Math.abs(source.y - target.y) < 20);
}

document.onkeydown = function(event) {
  let keypress = event.keyCode;
  // doesn't allow for opposite keys to the dir snake is going
  switch (keypress) {
    case 65:
      if (greenSnake.direction !== 2) {
        greenSnake.direction = 0;
        console.log("left");
      }
      break;
    case 87:
      if (greenSnake.direction !== 3) {
        greenSnake.direction = 1;
        console.log("up");
      }
      break;
    case 68:
      if (greenSnake.direction !== 0) {
        greenSnake.direction = 2;
        console.log("right");
      }
      break;
    case 83:
      if (greenSnake.direction !== 1) {
        greenSnake.direction = 3;
        console.log("down");
      }
      break;
    case 37:
      if (blueSnake.direction !== 2) {
        blueSnake.direction = 0;
        console.log("left");
      }
      break;
    case 38:
      if (blueSnake.direction !== 3) {
        blueSnake.direction = 1;
        console.log("up");
      }
      break;
    case 39:
      if (blueSnake.direction !== 0) {
        blueSnake.direction = 2;
        console.log("right");
      }
      break;
    case 40:
      if (blueSnake.direction !== 1) {
        blueSnake.direction = 3;
        console.log("down");
      }
      break;
  }
};

function checkGameOver(snake1, snake2) {
  let winner = "";
  let gameOver = false;
  for (let i in snake1.body) {
    if (i != 0) {
      if (collision(snake1.body[0], snake1.body[i])) {
        gameOver = true;
      }
    }
    if (collision(snake2.body[0], snake1.body[i])) {
      gameOver = true;
    }
  }
  for (let i in snake2.body) {
    if (i != 0) {
      if (collision(snake2.body[0], snake2.body[i])) {
        gameOver = true;
      }
    }
    if (collision(snake1.body[0], snake2.body[i])) {
      gameOver = true;
    }
  }

  if (gameOver) {
    if (snake1.score === snake2.score) winner = "It's a tie";
    else
      winner = snake1.score > snake2.score ? "The winner is player 1" : "The winner is player 2";
    clearInterval(intervalID);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#316D46";
    let gameOverText = "Game over! " + winner + ". Click to restart";
    ctx.fillText(gameOverText, WIDTH / 2, HEIGHT / 2);
  }
}
