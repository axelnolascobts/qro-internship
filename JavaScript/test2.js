// Q1
let x1 = "5" + 2
console.log(typeof (x1));
// Answer: string

// Q2
console.log(typeof (true));
// Answer: boolean

// Q3
// example of == loose equality:
console.log("5" == 5);

//example of === Strict equality:
console.log("5" === 5);

/* Answer: == is a loose equality, so more things can be true. For
    example, a different variable type, but same number will result in
    true.
    === is a strict equality, so everything matters more.
*/

// Q4
function example() {
    let y = true
    while (y === true) {
        y = false;
    };
}
console.log(example());
// Answer: Returns undefined.

// Q5
let empty_array = [];
// Answer: same as empty_array above.

// Q6
empty_array.push("item");
// Answer: .push() method

// Q7
empty_array.shift();
// Answer: .shift() method

// Q8
var age1 = 25;
const age2 = 30; // Can not define 2 variables with the same name
let name = "kevin"; // Give name a value to use toUpperCase().
console.log(name.toUpperCase());
const PI = 3.1416; // const variable has to be initialized in same line

let x = 5;
if (x > 0) { // Was missing parenthesis in if
    console.log("positive");
} else {
    console.log("negative or zero");
}

// Was missing parenthesis in for loop and "let" to initialize i variable.
for (let i = 1; i < 10; i++) {
    console.log(i);
}

let counter = 0;
while (counter < 5) {
    console.log(counter);
    counter++; // Was missing the increment to break loop.
}