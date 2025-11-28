// Import isBoardReady
const { isBoardReady } = require("./battleship");

// Valid configuration example
test("Valid board with correct ships and spacing", () => {
    const boats = [
        ["A1", "A5"], // Carrier (5)
        ["C1", "C4"], // Battleship (4)
        ["E1", "E3"], // Cruiser (3)
        ["G1", "G3"], // Submarine (3)
        ["I1", "I2"], // Destroyer (2)
    ];
    expect(isBoardReady(boats)).toBe(true);
});

// Invalid: ships touching
test("Invalid board: boats touching each other", () => {
    const boats = [
        ["A1", "A5"],
        ["A6", "A9"], // touches A5 diagonally
        ["C1", "C3"],
        ["E1", "E3"],
        ["G1", "G2"],
    ];
    expect(isBoardReady(boats)).toBe(false);
});
