let kids = `Anna, 5, 60
B, 100, 200
Grace, 2, 90
Bob, 12, 50
Dylan, 12, 90`;

let toys = [
  { description: "Doll", quantity: 2 },
  { description: "Robot", quantity: 2 }
];

function xmasList(kids, toys) {
  const kidsList = kids.trim().split("\n").map((line) => {
    const [name, age, score] = line.split(",").map(kid => kid.trim());
    return {
      name,
      age: parseInt(age),
      score: parseInt(score),
      gift: null,
      finalScore: this.parseInt(score) - this.parseInt(age) * 2
    };
  });

  let priorityList = [...kidsList].sort((a, b) => {
    return b.finalScore - a.finalScore;
  })

  priorityList.forEach((kid) => {
    const availableToy = toys.find(toy => toy.quantity > 0);
    if (availableToy) {
      availableToy.quantity--;
      kid.gift = availableToy.description;
    } else {
      kid.gift = "coal";
    }
  });

  return kidsList;
}

console.log(xmasList(kids, toys));
