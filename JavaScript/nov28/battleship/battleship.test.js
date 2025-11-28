// Edwin Rojas-Torres

const { isBoardReady } = require('./battleship.js');

describe('Battleship Board Validator', () => {
    test('should return true for a valid board with all boats correctly placed', () => {
        const boats = [
            ['A1', 'A5'], // Carrier (5 holes)
            ['C1', 'C4'], // Battleship (4 holes)
            ['E1', 'E3'], // Cruiser (3 holes)
            ['G1', 'G3'], // Submarine (3 holes)
            ['I1', 'I2']  // Destroyer (2 holes)
        ];
        expect(isBoardReady(boats)).toBe(true);
    });

    test('should return false when boats are placed too close to each other', () => {
        const boats = [
            ['A1', 'A5'], // Carrier (5 holes)
            ['B1', 'B4'], // Battleship (4 holes) - too close to Carrier
            ['E1', 'E3'], // Cruiser (3 holes)
            ['G1', 'G3'], // Submarine (3 holes)
            ['I1', 'I2']  // Destroyer (2 holes)
        ];
        expect(isBoardReady(boats)).toBe(false);
    });

    test('should return false when wrong number of boats is provided', () => {
        const boats = [
            ['A1', 'A5'], // Carrier (5 holes)
            ['C1', 'C4'], // Battleship (4 holes)
            ['E1', 'E3']  // Missing 2 boats
        ];
        expect(isBoardReady(boats)).toBe(false);
    });

    test('should return false when a boat has invalid length', () => {
        const boats = [
            ['A1', 'A5'], // Carrier (5 holes)
            ['C1', 'C6'], // Invalid length (6 holes)
            ['E1', 'E3'], // Cruiser (3 holes)
            ['G1', 'G3'], // Submarine (3 holes)
            ['I1', 'I2']  // Destroyer (2 holes)
        ];
        expect(isBoardReady(boats)).toBe(false);
    });

    test('should return false when a boat is placed diagonally', () => {
        const boats = [
            ['A1', 'A5'], // Carrier (5 holes)
            ['C1', 'F4'], // Diagonal placement
            ['E1', 'E3'], // Cruiser (3 holes)
            ['G1', 'G3'], // Submarine (3 holes)
            ['I1', 'I2']  // Destroyer (2 holes)
        ];
        expect(isBoardReady(boats)).toBe(false);
    });

    test('should return true with horizontal boat placements', () => {
        const boats = [
            ['1A', '1E'], // Carrier (5 holes) - horizontal
            ['3A', '3D'], // Battleship (4 holes) - horizontal
            ['5A', '5C'], // Cruiser (3 holes) - horizontal
            ['7A', '7C'], // Submarine (3 holes) - horizontal
            ['9A', '9B']  // Destroyer (2 holes) - horizontal
        ];
        expect(isBoardReady(boats)).toBe(true);
    });

    test('should return false when boat is out of board bounds', () => {
        const boats = [
            ['A1', 'A5'], // Carrier (5 holes)
            ['C1', 'C4'], // Battleship (4 holes)
            ['E1', 'E3'], // Cruiser (3 holes)
            ['L1', 'L3'], // Out of bounds (L is not valid, board is A-K)
            ['I1', 'I2']  // Destroyer (2 holes)
        ];
        expect(isBoardReady(boats)).toBe(false);
    });

    test('should return false when coordinate format is invalid', () => {
        const boats = [
            ['A1', 'A5'], // Carrier (5 holes)
            ['C1', 'C4'], // Battleship (4 holes)
            ['E1', 'E3'], // Cruiser (3 holes)
            ['G1', 'XYZ'], // Invalid format
            ['I1', 'I2']  // Destroyer (2 holes)
        ];
        expect(isBoardReady(boats)).toBe(false);
    });
});
