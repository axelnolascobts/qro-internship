// Edwin Rojas-Torres

function isBoardReady(boats) {
  const SHIP_SIZES = [5, 4, 3, 3, 2]; // Carrier, Battleship, Cruiser, Submarine, Destroyer

  let parsedBoats = [];
  let boatSizes = [];

  // All boats must be placed
  if (!boats || boats.length !== 5) {
    return false;
  }

  for (let boat of boats) {
    // Boat does not exist or invalid boat length
    if (!boat || boat.length !== 2) {
      return false;
    }

    let [coord1, coord2] = boat;
    let parsed1 = parseCoordinate(coord1);
    let parsed2 = parseCoordinate(coord2);

    // Check for valid coordinates
    if (!parsed1 || !parsed2) {
      return false;
    }

    if (!isValidCoordinate(parsed1) || !isValidCoordinate(parsed2)) {
      return false;
    }

    // If boat is diagonal
    if (parsed1.col !== parsed2.col && parsed1.row !== parsed2.row) {
      return false;
    }

    let boatCells = getBoatCells(parsed1, parsed2);
    boatSizes.push(boatCells.length);
    parsedBoats.push(boatCells);
  }

  const sortedSizes = [...boatSizes].sort((a, b) => b - a);
  if (JSON.stringify(sortedSizes) !== JSON.stringify(SHIP_SIZES)) {
    return false;
  }

  for (let i = 0; i < parsedBoats.length; i++) {
    for (let j = i + 1; j < parsedBoats.length; j++) {
      if (areBoatsTooClose(parsedBoats[i], parsedBoats[j])) {
        return false;
      }
    }
  }
  return true;
}

function parseCoordinate(coord) {
  if (!coord || typeof coord !== "string") {
    return null;
  }

  coord = coord.toUpperCase().trim();
  const letterFirst = coord.match(/^([A-Z])([0-9])$/);
  if (letterFirst) {
    return {
      row: parseInt(letterFirst[2]) - 1,
      col: letterFirst[1].charCodeAt(0) - 'A'.charCodeAt(0)
    };
  }
  const numberFirst = coord.match(/^([0-9])([A-Z])$/);
  if (numberFirst) {
    return {
      row: parseInt(numberFirst[1]) - 1,
      col: numberFirst[2].charCodeAt(0) - 'A'.charCodeAt(0)
    };
  }
  return null;
}

function isValidCoordinate(parsed) {
  return parsed.col >= 0 && parsed.col < 11 &&
    parsed.row >= 0 && parsed.row < 9;
}

function getBoatCells(coord1, coord2) {
  let cells = [];

  if (coord1.row === coord2.row) { // if horizontal
    let row = coord1.row;
    let maxCol = Math.max(coord1.col, coord2.col);
    let minCol = Math.min(coord1.col, coord2.col);

    for (let col = minCol; col <= maxCol; col++) {
      cells.push({ row, col });
    }
  } else { // if vertical
    let col = coord1.col;
    let maxRow = Math.max(coord1.row, coord2.row);
    let minRow = Math.min(coord1.row, coord2.row);

    for (let row = minRow; row <= maxRow; row++) {
      cells.push({ row, col });
    }
  }
  return cells;
}

function areBoatsTooClose(boat1, boat2) {
  for (let cell1 of boat1) {
    for (let cell2 of boat2) {
      let rowDiff = Math.abs(cell1.row - cell2.row);
      let colDiff = Math.abs(cell1.col - cell2.col);

      if (rowDiff <= 1 && colDiff <= 1) {
        return true;
      }
    }
  }
  return false;
}

module.exports = { isBoardReady };