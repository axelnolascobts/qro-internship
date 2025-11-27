function xmasList(kids, toys) {
  const kidsList = kids.trim().split("\n").map((line) => {
    const [name, age, score] = line.split(",").map(kid => kid.trim());
    return {
      name,
      age: parseInt(age),
      score: parseInt(score),
      gift: null,
      finalScore: parseInt(score) - parseInt(age) * 2
    };
  });

  let priorityList = [...kidsList].sort((a, b) => {
    return b.finalScore - a.finalScore;
  });

  priorityList.forEach((kid) => {
    const availableToy = toys.find(toy => toy.quantity > 0);
    if (availableToy) {
      availableToy.quantity--;
      kid.gift = availableToy.description;
    } else {
      kid.gift = "coal";
    }
  });

  kidsList.forEach(kid => delete kid.finalScore);

  return kidsList;
}
module.exports = xmasList;
