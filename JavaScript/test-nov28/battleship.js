// Name: Kevin Rojas-Torres
// Date: November 28, 2025

const boatType = {
    Carrier: 5,
    Battleship: 4,
    Cruiser: 3,
    Submarine: 3,
    Destroyer: 2
};

// Turns the boat coordinates into index abjects of {col:#, row:#}
function boatCoords(coord) {
    const validLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K'];
    const validNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let col = null;
    let row = null;

    // Check for valid letter, and assign it
    for (let i = 0; i < validLetters.length; i++) {
        if (coord.includes(validLetters[i])) {
            col = i;
        }

    }

    // Check for valid number, and assign it
    for (let i = 0; i < validNumbers.length; i++) {
        if (coord.includes(validNumbers[i])) {
            row = i;
        }
    }

    if (col === null || row === null) {
        return null;
    }

    return { col, row };

};

// List of all the cells/spaces a ship occupies
function getShipCells(start, end) {
    let cells = [];

    // vertical
    if (start.col === end.col) {
        const min = Math.min(start.row, end.row);
        const max = Math.max(start.row, end.row);

        for (let r = min; r <= max; r++) {
            cells.push({ col: start.col, row: r });
        }

        return cells;
    }

    // horizontal
    if (start.row === end.row) {
        const min = Math.min(start.col, end.col);
        const max = Math.max(start.col, end.col);

        for (let c = min; c <= max; c++) {
            cells.push({ col: c, row: start.row });
        }

        return cells;
    }

    return null; // diagonal is invalid
}

// Check if space is touching another ship
function isAdjacent(board, row, col) {
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (board[r] && board[r][c] === 1) {
                return true;
            }
        }
    }
}

// Builds and Validates the board
function isBoardReady(boats) {
    // Input can only be an array with 5 boats
    if (!Array.isArray(boats) || boats.length !== 5) {
        return false
    };

    // Empty Board, 9 rows × 11 cols
    const board = Array.from({ length: 9 }, () =>
        Array(11).fill(0));

    // Tracks which ship type is already used
    let usedShips = new Set();

    // Loop over each boat in the list
    for (let i = 0; i < boats.length; i++) {
        const boat = boats[i];

        if (!Array.isArray(boat) || boat.length !== 2) {
            return false
        };

        const c1 = boat[0];
        const c2 = boat[1];

        // Get coords
        const start = boatCoords(c1);
        const end = boatCoords(c2);

        // If empty or invalid coords
        if (!start || !end) {
            return false
        };

        // Get all cells the ship occupies
        const cells = getShipCells(start, end);
        if (!cells) return false;

        const shipLength = cells.length;

        // Variable for ship type
        let shipName = null;

        // Loop through all ship types
        for (let ship in boatType) {
            const correctSize = boatType[ship] === shipLength;
            const notUsedYet = !usedShips.has(ship);

            if (correctSize && notUsedYet) {
                shipName = ship;
                break;
            }
        }

        // If no matching ship type, found is invalid
        if (!shipName) {
            return false
        };

        usedShips.add(shipName);

        // Adjacency check 
        for (let j = 0; j < cells.length; j++) {
            const row = cells[j].row;
            const col = cells[j].col;

            if (isAdjacent(board, row, col)) {
                return false
            };
        }

        // Place ship on board
        for (let j = 0; j < cells.length; j++) {
            const row = cells[j].row;
            const col = cells[j].col;

            board[row][col] = 1;
        }
    }

    // Must have 5 ships placed to be true
    return usedShips.size === 5;
}

module.exports = { isBoardReady };