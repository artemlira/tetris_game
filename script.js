const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const TETROMINO_NAMES = ['o', 'j', 'i', 'z', 's'];

const TETROMINOES = {
  o: [
    [1, 1],
    [1, 1],
  ],
  j: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  i: [
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  s: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
};

function convertPositionIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}

let playField;
let tetromino;

function generatePlayField() {
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement('div');
    document.querySelector('.grid').append(div);
  }
  playField = new Array(PLAYFIELD_ROWS).fill().map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
}

function generateRandomNumber() {
  return Math.floor(Math.random() * (TETROMINO_NAMES.length + 1));
}

function generateTetromino() {
  const name = TETROMINO_NAMES[generateRandomNumber()];
  const matrix = TETROMINOES[name];
  console.log(matrix);
  tetromino = {
    name,
    matrix,
    row: 0,
    column: 5 - Math.floor(matrix.length / 2),
  };
}

generatePlayField();
generateTetromino();
const cells = document.querySelectorAll('.grid div');

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
  const name = tetromino.name;
  const tetrominoMatrixSize = tetromino.matrix?.length;

  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!tetromino.matrix[row][column]) continue;
      const cellIndex = convertPositionIndex(tetromino.row + row, tetromino.column + column);
      cells[cellIndex].classList.add(name);
    }
  }
}
// drawTetromino();
// drawPlayField();

function draw() {
  cells.forEach((cell) => cell.removeAttribute('class'));
  drawPlayField();
  drawTetromino();
}

draw();

document.addEventListener('keydown', onKeyDown);

function onKeyDown(e) {
  switch (e.key) {
    case 'ArrowDown':
      moveTetrominoDown();
      break;
    case 'ArrowLeft':
      moveTetrominoLeft();
      break;
    case 'ArrowRight':
      moveTetrominoRight();
      break;
  }
  draw();
}

function moveTetrominoDown() {
  tetromino.row++;
}

function moveTetrominoLeft() {
  tetromino.column--;
}

function moveTetrominoRight() {
  tetromino.column++;
}
