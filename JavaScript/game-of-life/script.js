//----------------------------------------------------------------
// Setup grid and interval variables.
// These determine size of grid.
const rows = 20;
const cols = 20;

//----------------------------------------------------------------
// DOM Elements (connect JS to HTML)
// Grabs the grid container and counter display.
const gridWrapper = document.querySelector(".the_grid");
const counter = document.querySelector(".stage_counter");

// Buttons for controlling the simulation
const startBtn = document.getElementById("start");
const nextBtn = document.getElementById("next");
const clearBtn = document.getElementById("clear");
const resetBtn = document.getElementById("reset");

// Hide reset button at the start
resetBtn.style.display = "none";

//----------------------------------------------------------------
// Variables for tracking/controlling the game's state
let grid = [];           // 2D array of Cell objects
let running = false;     // Whether simulation's running or not
let intervalID = null;   // Stores interval for automatic updates
let generation = 0;      // Tracks current generation count
let initialState = null; // Stores first pattern from user

//----------------------------------------------------------------
// Cell class
// Represents an individual grid and its behavior
class Cell {
    constructor(row, col, element) {
        this.row = row;         // Cell row index
        this.col = col;         // Cell column index
        this.element = element; // Reference to its HTML div
        this.alive = false;     // Default state is dead

        // Clicking toggles alive/dead before "start" or "next"
        element.addEventListener("click", () => this.toggle());
    };

    // Switch between dead/alive
    toggle() {
        this.alive = !this.alive;
        this.render();
    };

    // Explicitly set to dead/alive
    setState(tof) {
        this.alive = tof;
        this.render();
    };

    // Update CSS
    render() {
        this.element.classList.toggle("alive", this.alive);
    }
};

//----------------------------------------------------------------
// Creates the grid and creates Cell objects
function createGrid() {
    // Clear existing grid
    gridWrapper.innerHTML = "";

    // Reset grid and counter
    grid = [];
    generation = 0;
    counter.textContent = "Counter: 0";

    for (let row = 0; row < rows; row++) {
        // Holds cell objects per row
        const rowArray = [];

        for (let col = 0; col < cols; col++) {
            // Create cell div
            const cellDiv = document.createElement("div");
            cellDiv.classList.add("cell");

            // Add to HTML
            gridWrapper.appendChild(cellDiv);

            // Create Cell object and store it
            const cell = new Cell(row, col, cellDiv);
            rowArray.push(cell);
        }

        // Store all cell objects in that row
        grid.push(rowArray);
    }
}

//----------------------------------------------------------------
// Counts the alive neighbors around a cell (8 surrounding cells)
function getAliveNeighbors(row, col) {
    let count = 0;

    // Check all 8 surrounding cells
    for (let closeRow = -1; closeRow <= 1; closeRow++) {
        for (let closeCol = -1; closeCol <= 1; closeCol++) {

            // Skip the cell itself
            if (closeRow === 0 && closeCol === 0) {
                continue;
            }

            const neighborRow = row + closeRow;
            const neighborCol = col + closeCol;

            // Check if neighbor is inside grid bounds
            if (neighborRow >= 0 && neighborRow < rows
                && neighborCol >= 0 && neighborCol < cols) {
                if (grid[neighborRow][neighborCol].alive) {
                    count++;
                }
            }
        }
    }

    return count;
}

//----------------------------------------------------------------
// Generate the next state of the grid.
function nextGen() {
    const nextState = [];

    // Applies Conway's rules.
    for (let row = 0; row < rows; row++) {
        const rowState = [];

        for (let col = 0; col < cols; col++) {
            const cell = grid[row][col];
            const neighbors = getAliveNeighbors(row, col);

            let newAlive = cell.alive;

            // Conway's rules
            // If <2 or >3 neighbors, cell dies.
            if (cell.alive && (neighbors < 2 || neighbors > 3)) {
                newAlive = false; // Dies
            }
            // If cell's dead and has 3 neighbors, revives cell.
            else if (!cell.alive && neighbors === 3) {
                newAlive = true; // Revives
            }

            rowState.push(newAlive)
        }
        nextState.push(rowState);
    }

    // Apply updated state to each cell
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid[row][col].setState(nextState[row][col]);
        }
    }

    // Update generation counter
    generation++;
    counter.textContent = `Counter: ${generation}`;
}

// Save initial pattern the user made before running the game.
function saveInitialState() {
    if (initialState === null) {
        initialState = grid.map(row => row.map(cell => cell.alive));
    }
}

//----------------------------------------------------------------
// Button Controls

// Start button setup. Begins/stops automatic simulation
startBtn.addEventListener("click", () => {
    if (!running) {
        saveInitialState(); // Save original
        running = true;     // Activate simulation
        intervalID = setInterval(nextGen, 500); // Run every 500ms
        startBtn.textContent = "STOP"; // Turns Start button into stop

        // Swap Clear to Reset
        resetBtn.style.display = "inline-block";
        clearBtn.style.display = "none";
    }
    else {
        // Pause simulation and interval
        running = false;
        clearInterval(intervalID);
        startBtn.textContent = "START"; // Turns Stop button into Start
    }
});

// Next button setup. Manually advance 1 generation.
nextBtn.addEventListener("click", () => {
    if (!running) {
        saveInitialState(); // Save original

        // Swap Clear to Reset
        resetBtn.style.display = "inline-block";
        clearBtn.style.display = "none";

        // Advance 1 step
        nextGen();
    }
});

// Clear button setup. Kills all cells and resets counter
clearBtn.addEventListener("click", () => {
    grid.forEach(row => row.forEach(cell => cell.setState(false)));
    generation = 0;
    counter.textContent = "Counter: 0";

    // If simulation is running, stop it.
    if (running) {
        running = false;
        clearInterval(intervalID);
        startBtn.textContent = "START";
    }
});

// Reset button setup. Restores first pattern user created
resetBtn.addEventListener("click", () => {
    if (initialState) {
        // Restore the saved initial pattern
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                grid[row][col].setState(initialState[row][col]);
            }
        }
    }

    // Swap Reset to Clear
    resetBtn.style.display = "none";
    clearBtn.style.display = "inline-block";

    // Reset generation counter
    generation = 0;
    counter.textContent = "Counter: 0";
});

//----------------------------------------------------------------
// Initialize grid
createGrid();