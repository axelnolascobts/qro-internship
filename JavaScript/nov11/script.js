import { inputPrompt } from "../input.js"

// 1. Función que regresa el factorial de un número (usando recursividad).
const recursiveFactorial = (num) => {
  if (num === 0 || num === 1) {
    return 1;
  }
  return num * recursiveFactorial(num - 1);
}

// 2 . Función que regresa un valor boleanosegun si un número es primo o no.
const isPrime = (num) => {
  if (num === 0 || num === 1) {
    return false;
  }
  for (let i = 2; i < num; i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}

// 3. Función que recibe un arreglo de números y devuelve el mayor.
const findBiggest = (arr) => {
  let a = arr.sort();
  return a[arr.length - 1];
}

// 4. Función que recibe un string y devuelve cuántas vocales tiene.
const findVowels = (arr) => {
  const vowels = ['a', 'A', 'e', 'E', 'i', 'I', 'o', 'O', 'u', 'U'];
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (vowels.includes(arr[i])) {
      count++;
    }
  }
  return count;
}

// 5. Función que invierte una palabra (usando loops, no solo .reverse()).
const reverseString = (str) => {
  let charred = str.split('').map(String);
  let output = [];
  for (let i = charred.length - 1; i >= 0; i--) {
    output.push(charred[i]);
  }
  return output.join('');
}

// 6. Función que verifica si una palabra es palíndromo.
const isPalindrome = (str) => {
  let charred = str.split('').map(String);
  if (charred.every((charVal, i) => (charVal === charred.reverse()[i]))) {
    return true;
  }
  return false;
}

let factorialNum = Number(await inputPrompt("factorialNum: "));
console.log(`Recursive: ${recursiveFactorial(factorialNum)}\n`);

let primeCheckNum = Number(await inputPrompt("primeCheckNum: "));
console.log(`isPrime: ${isPrime(primeCheckNum)}\n`);

let numArr = (await inputPrompt("numArr: ")).split(',').map(Number);
console.log(`findBiggest: ${findBiggest(numArr)}\n`);

let charArr = (await inputPrompt("charArr: ")).split(',').map(String);
console.log(`findVowels: ${findVowels(charArr)}\n`);

let reverseStr = await inputPrompt("reverseStr: ");
console.log(`reverseString: ${reverseString(reverseStr)}\n`)

let palindromStr = await inputPrompt("palindromStr: ");
console.log(`isPalindrome: ${isPalindrome(palindromStr)}`);
