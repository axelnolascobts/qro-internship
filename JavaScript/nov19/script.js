const gridContainer = document.getElementById("gridContainer");

const CELL_SIZE = 30;
let COLS = 20;
let ROWS = 20;

let grid = createEmptyGrid();
let initialGrid = null;
let isRunning = false;
let animationId = null;
let generation = 0;
let population = 0;
let speed = 500;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const nextBtn = document.getElementById("nextBtn");
const clearBtn = document.getElementById("clearBtn");
const resetBtn = document.getElementById("resetBtn");

const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const generationCount = document.getElementById("generation");
const populationCount = document.getElementById("population");

function createEmptyGrid() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

function initGrid() {
  gridContainer.innerHTML = "";
  gridContainer.style.gridTemplateColumns = `repeat(${COLS}, ${CELL_SIZE}px)`;
  gridContainer.style.gridTemplateRows = `repeat(${ROWS}, ${CELL_SIZE}px)`;

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;

      cell.addEventListener("click", () => {
        grid[i][j] = grid[i][j] === 1 ? 0 : 1;
        updateGrid();
      });
      gridContainer.appendChild(cell);
    }
  }
  return;
}

function updateGrid() {
  const cells = gridContainer.querySelectorAll(".cell");

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const cell = cells[i * COLS + j];

      if (grid[i][j] === 1) {
        cell.classList.add("alive");
      } else {
        cell.classList.remove("alive");
      }
    }
  }
  populationCount.textContent = updatePop();
  return;
}

function updatePop() {
  const aliveCells = gridContainer.querySelectorAll(".alive");
  return aliveCells.length;
}

function countNeighbors(grid, x, y, rows, cols) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const newX = (x + i + rows) % rows;
      const newY = (y + j + cols) % cols;
      count += grid[newX][newY];
    }
  }
  return count;
}

function nextGeneration() {
  const newGrid = createEmptyGrid();

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const neighbors = countNeighbors(grid, i, j, ROWS, COLS);
      const cell = grid[i][j];

      if (cell === 1 && (neighbors === 2 || neighbors === 3)) {
        newGrid[i][j] = 1;
      } else if (cell === 0 && neighbors === 3) {
        newGrid[i][j] = 1;
      } else {
        newGrid[i][j] = 0;
      }
    }
  }
  grid = newGrid;
  generationCount.textContent = generation++;
  populationCount.textContent = updatePop();
  return;
}

function animate() {
  if (isRunning) {
    nextGeneration();
    updateGrid();
    setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, speed);
  }
  return;
}

function updateButtons() {
  if (isRunning) {
    startBtn.style.display = 'none';
    clearBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    resetBtn.style.display = 'inline-block';
  } else {
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    if (initialGrid !== null && generation > 0) {
      clearBtn.style.display = 'none';
      resetBtn.style.display = 'inline-block';
    } else {
      clearBtn.style.display = 'inline-block';
      resetBtn.style.display = 'none';
    }
  }
  return;
}

function start() {
  if (!isRunning) {
    if (initialGrid === null) {
      initialGrid = grid.map(row => [...row]);
      populationCount.textContent = updatePop();
    }
    isRunning = true;
    updateButtons();
    animate();
  }
  return;
}

function stop() {
  isRunning = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  updateButtons();
  return;
}

function next() {
  if (initialGrid === null) {
    initialGrid = grid.map(row => [...row]);
  }
  nextGeneration();
  updateGrid();
  generationCount.textContent = generation;
  updateButtons();
  return;
}

function clear() {
  stop();
  grid = createEmptyGrid();
  initialGrid = null;
  generation = 0;
  population = 0;
  updateGrid();
  generationCount.textContent = generation;
  populationCount.textContent = population;
  updateButtons();
  return;
}

function reset() {
  stop();
  grid = initialGrid.map(row => [...row]);
  generation = 0;
  updateGrid();
  generationCount.textContent = generation;
  populationCount.textContent = updatePop();
  updateButtons();
  return;
}

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
nextBtn.addEventListener("click", next);
clearBtn.addEventListener("click", clear);
resetBtn.addEventListener("click", reset);

speedSlider.addEventListener("input", (e) => {
  speed = parseInt(e.target.value);
  speedValue.textContent = `${speed}ms`;
});

initGrid();
updateButtons();