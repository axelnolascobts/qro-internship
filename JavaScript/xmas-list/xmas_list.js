// Name: Kevin Rojas-Torres
// Date: November, 27, 2025

function xmasList(kids, toys) {
    // List of kids, and each kid is a list
    let kidsList = kids
        .trim() // remove outer whitespace from template literal
        .split("\n") // split into lines
        .map(row => row.trim()) // trim each line
        .filter(row => row.length > 0) // remove empty lines
        // comma separate and trim
        .map(row => row.split(",").map(info => info.trim()));

    // List of kid objects
    let objectsArray = kidsList.map((entry, index) => {
        const [name, ageStr, scoreStr] = entry;
        const age = Number(ageStr);
        const score = Number(scoreStr);

        return {
            index,
            name,
            age,
            score,
            finalScore: score - age * 2, // required formula
            gift: "coal"
        };
    });

    // Sort kids in order of finalScore
    objectsArray.sort((a, b) => b.finalScore - a.finalScore);

    // Place toy information into gift
    let kidIndex = 0;
    for (let toy = 0; toy < toys.length; toy++) {
        // Make sure quantity is an int
        toys[toy].quantity = Number(toys[toy].quantity);

        while (toys[toy].quantity > 0 && kidIndex < objectsArray.length) {
            objectsArray[kidIndex].gift = toys[toy].description;

            kidIndex++;
            toys[toy].quantity--;
        }
    }

    // Sort to original order
    objectsArray.sort((a, b) => a.index - b.index);

    // Get rid of index from objects
    objectsArray.forEach(obj => {
        delete obj.index;
    });

    // {Kid info:..., gift:...}
    return objectsArray;
}

//---------------------------------------------------
// Test Cases
const kids = "Kevin, 22, 90 \n \
                    Edwin, 24, 200"
const toys = [
    { description: "Train", quantity: 2 }
];

const result = xmasList(kids, toys);
console.log(result);

module.exports = xmasList;