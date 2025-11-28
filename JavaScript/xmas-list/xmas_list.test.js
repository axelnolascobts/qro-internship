// Import file
const xmasList = require("./xmas_list.js");

// Test Cases
describe("xmasList()", () => {
    test("accepts newline separated list", () => {
        const kids = "Kevin, 22, 90 \n \
                    Edwin, 24, 200"
        const toys = [
            { description: "Train", quantity: 2 }
        ];

        const result = xmasList(kids, toys);
        console.log(result);

        expect(result).toEqual([{ name: 'Kevin', age: 22, score: 90, finalScore: 46, gift: 'Train' },
        { name: 'Edwin', age: 24, score: 200, finalScore: 152, gift: 'Train' }]);
    })

    test("accepts a multiline template literal string list", () => {
        const kids = `
            Kevin, 22, 90
            Edwin, 24, 200`
        const toys = [
            { description: "Train", quantity: 2 }
        ];

        const result = xmasList(kids, toys);
        console.log(result);

        expect(result).toEqual([{ name: 'Kevin', age: 22, score: 90, finalScore: 46, gift: 'Train' },
        { name: 'Edwin', age: 24, score: 200, finalScore: 152, gift: 'Train' }]);
    })

    test("calculates finalScore using formula score - age * 2", () => {
        const kids = "Kevin, 22, 99\nEdwin, 23, 98";
        const toys = [];

        const result = xmasList(kids, toys);

        expect(result[0].finalScore).toBe(99 - 22 * 2); // 55
        expect(result[1].finalScore).toBe(98 - 23 * 2); // 52
    });

    test("kids return in the same order they were provided", () => {
        const kids = `
            A, 10, 90
            B, 15, 200
            C, 12, 95
        `;

        const toys = [
            { description: "Train", quantity: 2 }
        ];

        const result = xmasList(kids, toys);

        // Kids should appear A, B, C even though scores differ
        expect(result[0].name).toBe("A");
        expect(result[1].name).toBe("B");
        expect(result[2].name).toBe("C");
    });

    test("assigns gifts based on highest finalScore & coal to leftover kid", () => {
        const kids = `
            Kevin, 22, 99
            Edwin, 24, 99
            Eric, 5, 77
        `;

        const toys = [
            { description: "Foam Sword", quantity: 1 },
            { description: "Nerf Gun", quantity: 1 }
        ];

        const result = xmasList(kids, toys);


        // Returned IN ORIGINAL ORDER

        expect(result[0].gift).toBe("Nerf Gun");
        // Kevin: 99 - 22*2 = 55  -> gets second gift

        expect(result[1].gift).toBe("coal");
        // Edwin: 98 - 23*2 = 52  -> gets coal

        expect(result[2].gift).toBe("Foam Sword");
        // Eric:  77 - 5*2 = 67  -> gets first gift
    });

})