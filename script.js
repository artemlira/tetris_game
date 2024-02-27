const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const TETROMINO_NAMES = ['O', 'J', 'I', 'Z', 'S', 'T'];

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
  return Math.floor(Math.random() * TETROMINO_NAMES.length);
}

function generateTetromino() {
  const name = TETROMINO_NAMES[generateRandomNumber()];
  const matrix = TETROMINOES[name];
  const rowTetro = 0;

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
      if (tetromino.matrix[row][column]) {
        playField[tetromino.row + row][tetromino.column + column] = tetromino.name;
      }
    }
  }
  const filledRows = findFilledRows();
  romoveFillRows(filledRows);
  generateTetromino();
}

function romoveFillRows(filledRows) {
  filledRows.forEach((item) => {
    const row = item;
    dropRowsAbove(row);
  });
}

function dropRowsAbove(rowDelete) {
  for (let row = rowDelete; row > 0; row--) {
    playField[row] = playField[row - 1];
  }
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
      if (isOutsideOfTopboard(row)) continue;
      if (!tetromino.matrix[row][column]) continue;
      const cellIndex = convertPositionIndex(tetromino.row + row, tetromino.column + column);
      // cells[cellIndex].innerHTML = showRotated[row][column];
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

function rotateTetromino() {
  const oldMatrix = tetromino.matrix;
  const rotatedMatrix = rotateMatrix(tetromino.matrix);
  // showRotated = rotateMatrix(tetromino.matrix);
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

function onKeyDown(e) {
  switch (e.key) {
    case 'ArrowUp':
      rotate();
      break;
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
  startLoop();
}
let timeId = null;
moveDown();

function startLoop() {
  setTimeout(() => {
    timeId = requestAnimationFrame(moveDown);
  }, 700);
}

function stopLoop() {
  cancelAnimationFrame(timeId);
  timeId = clearTimeout(timeId);
}

function isValid() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      // if (tetromino.matrix[row][column]) continue;
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
