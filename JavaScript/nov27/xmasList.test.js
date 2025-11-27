const xmasList = require("./xmasList.js");

test("kids get gifts", () => {
  const kids = `Anna, 5, 60
B, 100, 100
Grace, 2, 90
Bob, 12, 50
Dylan, 12, 90`;

  const toys = [
    { description: "Doll", quantity: 1 },
    { description: "Robot", quantity: 1 }
  ];

  expect(xmasList(kids, toys)).toEqual([
    { name: 'Anna', age: 5, score: 60, gift: 'coal' },
    { name: 'B', age: 100, score: 100, gift: 'coal' },
    { name: 'Grace', age: 2, score: 90, gift: 'Doll' },
    { name: 'Bob', age: 12, score: 50, gift: 'coal' },
    { name: 'Dylan', age: 12, score: 90, gift: 'Robot' }
  ]);
});

test("all kids get coal when no toys available", () => {
  const kids = `Anna, 5, 60
Bob, 10, 80`;

  const toys = [];

  expect(xmasList(kids, toys)).toEqual([
    { name: 'Anna', age: 5, score: 60, gift: 'coal' },
    { name: 'Bob', age: 10, score: 80, gift: 'coal' }
  ]);
});

test("all kids get toys when more toys than kids", () => {
  const kids = `Anna, 5, 60
Bob, 10, 80`;

  const toys = [
    { description: "Doll", quantity: 1 },
    { description: "Robot", quantity: 1 },
    { description: "Ball", quantity: 1 }
  ];

  expect(xmasList(kids, toys)).toEqual([
    { name: 'Anna', age: 5, score: 60, gift: 'Robot' },
    { name: 'Bob', age: 10, score: 80, gift: 'Doll' }
  ]);
});

test("single kid gets first available toy", () => {
  const kids = `Anna, 5, 60`;

  const toys = [
    { description: "Doll", quantity: 1 }
  ];

  expect(xmasList(kids, toys)).toEqual([
    { name: 'Anna', age: 5, score: 60, gift: 'Doll' }
  ]);
});

test("highest finalScore gets first toy (priority logic)", () => {
  const kids = `LowScore, 5, 30
HighScore, 5, 90`;

  const toys = [
    { description: "BestToy", quantity: 1 }
  ];

  const result = xmasList(kids, toys);
  
  expect(result).toEqual([
    { name: 'LowScore', age: 5, score: 30, gift: 'coal' },
    { name: 'HighScore', age: 5, score: 90, gift: 'BestToy' }
  ]);
});

test("result maintains original input order, not priority order", () => {
  const kids = `Anna, 5, 30
Bob, 5, 90
Charlie, 5, 60`;

  const toys = [
    { description: "Toy1", quantity: 1 },
    { description: "Toy2", quantity: 1 }
  ];

  const result = xmasList(kids, toys);
  
  expect(result[0].name).toBe('Anna');
  expect(result[1].name).toBe('Bob');
  expect(result[2].name).toBe('Charlie');
});

test("handles negative finalScore (old kids with low scores)", () => {
  const kids = `Grandpa, 100, 50
Kid, 5, 50`;

  const toys = [
    { description: "Toy", quantity: 1 }
  ];

  expect(xmasList(kids, toys)).toEqual([
    { name: 'Grandpa', age: 100, score: 50, gift: 'coal' },
    { name: 'Kid', age: 5, score: 50, gift: 'Toy' }
  ]);
});

test("handles toys with quantity greater than 1", () => {
  const kids = `Anna, 5, 60
Bob, 5, 70
Charlie, 5, 80`;

  const toys = [
    { description: "Doll", quantity: 2 }
  ];

  const result = xmasList(kids, toys);
  
  const dollCount = result.filter(kid => kid.gift === 'Doll').length;
  expect(dollCount).toBe(2);
  expect(result.filter(kid => kid.gift === 'coal').length).toBe(1);
});

test("handles extra whitespace in input", () => {
  const kids = `  Anna  ,  5  ,  60  
  Bob  ,  10  ,  80  `;

  const toys = [
    { description: "Doll", quantity: 1 }
  ];

  expect(xmasList(kids, toys)).toEqual([
    { name: 'Anna', age: 5, score: 60, gift: 'coal' },
    { name: 'Bob', age: 10, score: 80, gift: 'Doll' }
  ]);
});

test("single kid gets coal when toys array is empty", () => {
  const kids = `Anna, 5, 60`;

  const toys = [];

  expect(xmasList(kids, toys)).toEqual([
    { name: 'Anna', age: 5, score: 60, gift: 'coal' }
  ]);
});
