const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 12;
const paddleHeight = 90;
const paddleInset = 24;
const ballRadius = 8;
const playerSpeed = 420;
const computerSpeed = 300;
const startingBallSpeed = 360;
const maxBallSpeed = 720;
const maxBounceAngle = Math.PI / 3;

const player = {
  x: paddleInset,
  y: (canvas.height - paddleHeight) / 2,
  score: 0,
};

const computer = {
  x: canvas.width - paddleInset - paddleWidth,
  y: (canvas.height - paddleHeight) / 2,
  score: 0,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  speed: startingBallSpeed,
};

const keys = new Set();
let previousFrameTime = 0;

function serve(direction) {
  const angle = (Math.random() - 0.5) * 0.7;
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = startingBallSpeed;
  ball.vx = Math.cos(angle) * ball.speed * direction;
  ball.vy = Math.sin(angle) * ball.speed;
}

function movePlayer(deltaTime) {
  if (keys.has("ArrowUp")) {
    player.y -= playerSpeed * deltaTime;
  }
  if (keys.has("ArrowDown")) {
    player.y += playerSpeed * deltaTime;
  }
  player.y = Math.max(0, Math.min(canvas.height - paddleHeight, player.y));
}

function moveComputer(deltaTime) {
  const targetY = ball.vx >0
    ? ball.y - paddleHeight / 2
    : (canvas.height - paddleHeight)/ 2
  const distance = targetY - computer.y;
  const maxMovement = computerSpeed * deltaTime;
  computer.y += Math.max(-maxMovement, Math.min(maxMovement, distance));
  computer.y = Math.max(0, Math.min(canvas.height - paddleHeight, computer.y));
}

function bounceOffPaddle(paddle, direction) {
  const hitPosition = (ball.y - (paddle.y + paddleHeight / 2)) / (paddleHeight / 2);
  const angle = hitPosition * maxBounceAngle;

  ball.speed = Math.min(ball.speed + 20, maxBallSpeed);
  ball.vx = Math.cos(angle) * ball.speed * direction;
  ball.vy = Math.sin(angle) * ball.speed;
}

function updateBall(deltaTime) {
  ball.x += ball.vx * deltaTime;
  ball.y += ball.vy * deltaTime;

  if (ball.y - ballRadius <= 0) {
    ball.y = ballRadius;
    ball.vy = Math.abs(ball.vy);
  } else if (ball.y + ballRadius >= canvas.height) {
    ball.y = canvas.height - ballRadius;
    ball.vy = -Math.abs(ball.vy);
  }

  if (
    ball.vx < 0 &&
    ball.x - ballRadius <= player.x + paddleWidth &&
    ball.x + ballRadius >= player.x &&
    ball.y + ballRadius >= player.y &&
    ball.y - ballRadius <= player.y + paddleHeight
  ) {
    ball.x = player.x + paddleWidth + ballRadius;
    bounceOffPaddle(player, 1);
  } else if (
    ball.vx > 0 &&
    ball.x + ballRadius >= computer.x &&
    ball.x - ballRadius <= computer.x + paddleWidth &&
    ball.y + ballRadius >= computer.y &&
    ball.y - ballRadius <= computer.y + paddleHeight
  ) {
    ball.x = computer.x - ballRadius;
    bounceOffPaddle(computer, -1);
  }
  if (ball.x + ballRadius < 0) 
  {
    computer.score += 1;
    serve(-1);
  } else if (ball.x - ballRadius > canvas.width) {
    player.score += 1;
    serve(1);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#6b5bf8";

  ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);
  ctx.fillStyle = "#f11d1d";
  ctx.fillRect(computer.x, computer.y, paddleWidth, paddleHeight);

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.setLineDash([10, 12]);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(player.score, canvas.width / 2 - 60, 64);
  ctx.fillText(computer.score, canvas.width / 2 + 60, 64);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop(timestamp) {
  const deltaTime = Math.min((timestamp - previousFrameTime) / 1000, 1 / 60);
  previousFrameTime = timestamp;

  movePlayer(deltaTime);
  moveComputer(deltaTime);
  updateBall(deltaTime);
  draw();

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
    keys.add(event.key);
  }
});

document.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

serve(Math.random() < 0.5 ? -1 : 1);
requestAnimationFrame(gameLoop);
