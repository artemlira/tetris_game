const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const TETROMINO_NAMES = ['O', 'J', 'I', 'Z', 'S', 'T'];
const scoreElement = document.querySelector('.score');
let timer = document.querySelector('.timer');
const play = document.querySelector(`.play`);
const stop = document.querySelector(`.stop`);
const pause = document.querySelector(`.pause`);
const btnRestart = document.querySelector(`.btn-restart`);
const overlay = document.querySelector('.overlay');
const up = document.querySelector('.up');
const left = document.querySelector('.left');
const right = document.querySelector('.right');
const down = document.querySelector('.down');
const buttons = document.querySelectorAll('.game-buttons i');
let nextFigure = null;
let timerId = null;
let timeId = null;
let playField;
let tetromino;
let score = 0;
let seconds = 0;
let minutes = 0;
let hours = 0;
let isPaused = false;
let isGameOver = false;
let cells;
scoreElement.innerHTML = score;

const TETROMINOES = {
  O: [
    [1, 1],
    [1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

function updateTime() {
  seconds++;
  if (seconds === 60) {
    minutes++;
    seconds = 0;
  }
  if (minutes === 60) {
    hours++;
    minutes = 0;
  }
  timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function init() {
  score = 0;
  seconds = 0;
  minutes = 0;
  hours = 0;
  scoreElement.innerHTML = 0;
  isGameOver = false;
  generatePlayField();
  generateTetromino();
  cells = document.querySelectorAll('.grid div');
  moveDown();
}

function restartGame() {
  document.querySelector('.grid').innerHTML = '';
  overlay.style.display = 'none';
  init();
}

btnRestart.addEventListener('click', restartGame);
stop.addEventListener('click', restartGame);

function convertPositionIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}

function countScore(destroyRows) {
  switch (destroyRows) {
    case 1:
      score += 10;
      break;
    case 2:
      score += 20;
      break;
    case 3:
      score += 50;
      break;
    case 4:
      score += 100;
      break;
  }
  scoreElement.innerHTML = score;
}

function generatePlayField() {
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement('div');
    document.querySelector('.grid').append(div);
  }
  playField = new Array(PLAYFIELD_ROWS).fill().map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
}

function generateRandomNumber() {
  return Math.floor(Math.random() * TETROMINO_NAMES.length);
}

function generateTetromino() {
  const name = TETROMINO_NAMES[generateRandomNumber()];
  const matrix = TETROMINOES[name];
  const rowTetro = -2;

  tetromino = {
    name,
    matrix,
    row: rowTetro,
    column: Math.floor((PLAYFIELD_COLUMNS - matrix[0].length) / 2),
  };
}

function placeTetromino() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (isOutsideOfTopboard(row)) {
        isGameOver = true;
        return;
      }
      if (tetromino.matrix[row][column]) {
        playField[tetromino.row + row][tetromino.column + column] = tetromino.name;
      }
    }
  }

  const filledRows = findFilledRows();
  romoveFillRows(filledRows);
  generateTetromino();
  countScore(filledRows.length);
}
function romoveFillRows(filledRows) {
  filledRows.forEach((item) => {
    const row = item;
    dropRowsAbove(row);
  });
}

function dropRowsAbove(rowDelete) {
  playField[rowDelete].forEach((i) =>
    document.querySelector('.' + i).classList.add('animate__animated', 'animate__bounceOut'),
  );

  for (let row = rowDelete; row > 0; row--) {
    playField[row] = playField[row - 1];
  }

  playField[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function findFilledRows() {
  const fillRows = [];

  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    let filledColumns = 0;
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (playField[row][column] != 0) {
        filledColumns++;
      }
    }
    if (PLAYFIELD_COLUMNS === filledColumns) {
      fillRows.push(row);
    }
  }

  return fillRows;
}

generatePlayField();
generateTetromino();
cells = document.querySelectorAll('.grid div');

function drawPlayField() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (playField[row][column] == 0) continue;
      const name = playField[row][column];
      const cellIndex = convertPositionIndex(row, column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawTetromino() {
  const name = tetromino?.name;
  const tetrominoMatrixSize = tetromino?.matrix?.length;

  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (isOutsideOfTopboard(row)) continue;
      if (!tetromino.matrix[row][column]) continue;
      const cellIndex = convertPositionIndex(tetromino.row + row, tetromino.column + column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function draw() {
  cells.forEach((cell) => cell.removeAttribute('class'));
  drawPlayField();
  drawTetromino();
}

function rotateTetromino() {
  const oldMatrix = tetromino.matrix;
  const rotatedMatrix = rotateMatrix(tetromino.matrix);
  tetromino.matrix = rotatedMatrix;
  if (!isValid()) {
    tetromino.matrix = oldMatrix;
  }
}

draw();

function rotate() {
  rotateTetromino();
  draw();
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', () => {
  buttons.forEach((btn) => btn.classList.remove('active'));
});
play.addEventListener('click', () => {
  moveDown();
  if (isPaused) {
    togglePauseGame();
  }
});

pause.addEventListener('click', () => {
  togglePauseGame();
});

up.addEventListener('click', rotate);
left.addEventListener('click', moveTetrominoLeft);
right.addEventListener('click', moveTetrominoRight);
down.addEventListener('click', dropTetrominoDown);

function onKeyDown(e) {
  if (e.key === 'Escape') {
    togglePauseGame();
  }
  if (!isPaused) {
    switch (e.key) {
      case ' ':
        dropTetrominoDown();
        break;
      case 'ArrowUp':
        rotate();
        up.classList.add('active');
        break;
      case 'ArrowDown':
        moveTetrominoDown();
        down.classList.add('active');
        break;
      case 'ArrowLeft':
        moveTetrominoLeft();
        left.classList.add('active');
        break;
      case 'ArrowRight':
        moveTetrominoRight();
        right.classList.add('active');
        break;
    }
  }
  draw();
}

function dropTetrominoDown() {
  while (isValid()) {
    tetromino.row++;
  }
  tetromino.row--;
}

function gameOver() {
  stopLoop();
  overlay.style.display = 'flex';
}

function rotateMatrix(matrixTetromino) {
  const N = matrixTetromino.length;
  const rotateMatrix = [];
  for (let i = 0; i < N; i++) {
    rotateMatrix[i] = [];
    for (let j = 0; j < N; j++) {
      rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
    }
  }
  return rotateMatrix;
}
function moveTetrominoDown() {
  tetromino.row++;
  if (!isValid()) {
    tetromino.row--;
    placeTetromino();
  }
}

function moveTetrominoLeft() {
  tetromino.column--;
  if (!isValid()) {
    tetromino.column++;
  }
}

function moveTetrominoRight() {
  tetromino.column++;
  if (!isValid()) {
    tetromino.column--;
  }
}

function moveDown() {
  moveTetrominoDown();
  draw();
  stopLoop();
  stopTimer();
  startLoop();
  startTimer();
  if (isGameOver) {
    gameOver();
  }
}

function startTimer() {
  timerId = setTimeout(() => {
    requestAnimationFrame(updateTime);
  }, 700);
}

function startLoop() {
  timeId = setTimeout(() => {
    requestAnimationFrame(moveDown);
  }, 700);
}

function stopLoop() {
  cancelAnimationFrame(timeId);
  clearTimeout(timeId);
  timeId = null;
}

function stopTimer() {
  cancelAnimationFrame(timerId);
  clearTimeout(timerId);
  timerId = null;
}

function togglePauseGame() {
  isPaused ? startLoop() : stopLoop();
  isPaused ? startTimer() : stopTimer();
  isPaused = !isPaused;
}

function isValid() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (isOutsideOfGameboard(row, column)) {
        return false;
      }
      if (hasCollisions(row, column)) {
        return false;
      }
    }
  }

  return true;
}

function isOutsideOfTopboard(row) {
  return tetromino.row + row < 0;
}

function isOutsideOfGameboard(row, column) {
  return (
    tetromino.matrix[row][column] &&
    (tetromino.column + column < 0 ||
      tetromino.column + column >= PLAYFIELD_COLUMNS ||
      tetromino.row + row >= PLAYFIELD_ROWS)
  );
}

function hasCollisions(row, column) {
  return tetromino.matrix[row][column] && playField[tetromino.row + row]?.[tetromino.column + column];
}
