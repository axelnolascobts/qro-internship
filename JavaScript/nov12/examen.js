// Si escribes let x = "5" + 2;, ¿cuál será el valor de x?
// x = 57
//
// ¿Qué devuelve la función typeof(true)?
// boolean
//
// ¿Cual es la diferencia entre == y === ?
// "==" hace type conversion al hacer la comparasion
// "===" actua como comparasion actual
//
// ¿Qué devuelve una función que no tiene return explícito?
// Depende de los tipos de datos que usan la funcion.
//
// ¿Cómo se declara un arreglo vacío en JavaScript?
// let arr = [] o let arr = new Array()
//
// ¿Qué método agrega un elemento al final de un arreglo?
// arr.push()
//
// ¿Qué método elimina el primer elemento de un arreglo?
// arr.shift()
//
// find and correct the errors in this code:

// var age = 25; reassignment to const
const age = 30;

// let name;
// console.log(name.toUpperCase()); // Name is empty

let name = "edwin";
console.log(name.toUpperCase());

// const PI;
// PI = 3.1416; // cannot reassign const, must be declared with const varName = *;
const PI = 3.1416

// let x = 5;
// if x > 0 { // parentheses missing
//   console.log("positive");
// } else {
//   console.log("negative or zero");
// }

let x = 5;
if (x > 0) {
  console.log("positive");
} else {
  console.log("negative or zero");
}

// for i = 1; i < 10; i++ { // let is missing in declaration of i, and parentheses missing
//   console.log(i);
// }

for (let i = 1; i < 10; i++) {
  console.log(i);
}

// let counter = 0;
// while (counter < 5) {
//   console.log(counter);
// }
// infinite loop

let counter = 0;
while (counter < 5) {
  console.log(counter);
  counter++;
}
