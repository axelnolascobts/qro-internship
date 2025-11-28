// Name: Kevin Rojas-Torres
// Date: November 28, 2025

// Q1: Nombra 3 métodos de Array y explica que hacen
/* Answer:
    - .map()
        - Creates a new copy of the chosen array that is independent of the original (if you modify one array, it will NOT change the other). This new array can be changed upon creation, if you place a function inside the parentheses ‘()’.
        - Syntax:
            Const newArray = originalArray.map(function)

    - .forEach()
        - Allows you to iterate through an array and access/modify its elements based on the function inside the parentheses ‘()’.
        - Syntax:
            array.forEach(function)

    - .filter()
        - Creates a new array that only contains the elements from the original array that passed the conditional.
        - Syntax:
            const newArray = originalArray.filter(condition)

 */

// Q2: Escribe el código para crear una clase user con los campos name y age, su constructor
// y los metodos set y get para uno de los campos

class User {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    set(number) {
        return this.age = number;
    }

    get() {
        return this.age;
    }
}

// Q3: Declara una función que espere un segundo y después imprima algo
function waitUp() {
    setTimeout(() => console.log("Hello"), 1000);
};

waitUp();


// Q4: ¿Qué es un callback?
// Answer: A callback is a function that is used as a parameter of another function.

// Q5: Explica qué es una promesa y escribe un ejemplo.
/* Answer:
A promise is an object that has one of three values: 
pending (waiting for resolved or rejected), 
resolved (condition got accepted with no errors), 
or rejected (error/failure occurred).
*/
// Example:
let Flag = true;
const promise = new Promise((resolve, reject) => {
    if (Flag) {
        resolve("Resolved, Flag is true");
    }
    else {
        reject("Rejected, Flag is false");
    }
});
console.log("Promise result: ", promise);

/* Q6: Dado el siguiente HTML:
<button id=”btn”>Haz click</button>
<p id=”mensaje”></p>
Escribe el JS para que al hacer clic en el botón, el <p> muestre:
“Botón presionado” */

//!!Comment this out when testing other questions. Check out 
// test.html instead!!
const exampleBtn = document.getElementById("btn");
const exampleMsg = document.getElementById("message");

exampleBtn.addEventListener("click", () => {
    exampleMsg.textContent = "Button Pressed";
});

/* Q7: Haz una petición a la API
https://jsonplaceholder.typicode.com/posts
y muestra en consola solo los títulos.
*/
//!!Comment this out when testing other questions. Check out 
// test.html instead!!
fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => { return response.json(); })
    .then(data => {
        const answer = data.map(titles => titles.title);
        console.log(answer);

    })
    .catch(error => {
        console.error("Error: ", error.message);
    });

// Q8: Explica qué es un closure y escribe un ejemplo
/* Answer:
    A closure is a function inside a parent function that remembers
    the variables of the parent function.
*/
// Example:
function parent() {
    let counter = 0;
    return function count3() {
        while (counter < 3) {
            counter++;
        }
        return counter;
    };
}
const count = parent();
console.log(count());

// Q9: ¿Qué es el unit testing y para qué sirve?
/* Answer:
    Unit testing is when you test different aspects of your code
    (usually tests on functions or methods of the code) in order
    to debug it and/or to test functionalities and see if it
    works as intended.
 */

// Q10: Explica qué es una IIFE y escribe un ejemplo.
/* Answer:
    IIFE are functions that immediately run when they are defined.
    You do not need to call it for the function to run.
 */
// Example:
(function () {
    console.log("IIFE test");
})();