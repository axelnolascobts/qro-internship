import { inputPrompt } from "../input.js";

console.log("1. Verify if a number is positive, negative, or zero");
let num1 = Number(await inputPrompt("Give me a number to determine if it is positive or negative: "));
if (num1 > 0) {
  console.log("Positive");
} else if (num1 < 0) {
  console.log("Negative");
} else {
  console.log("Zero");
}
console.log();


console.log("2. Return the name of the day");
let num2 = Number(await inputPrompt("Give me a number for the weekday: "));
switch (num2) {
  case 1:
    console.log("Monday");
    break;
  case 2:
    console.log("Tuesday");
    break;
  case 3:
    console.log("Wednesday");
    break;
  case 4:
    console.log("Thursday");
    break;
  case 5:
    console.log("Friday");
    break;
  case 6:
    console.log("Saturday");
    break;
  case 7:
    console.log("Sunday");
    break;
  default:
    console.log("Not a valid number.");
    break;
}
console.log();

console.log("3. Sum numbers from 1 to 100");
let num3 = 0;
for (let i = 1; i < 101; i++) {
  num3 = num3 + i;
}
console.log(num3);
console.log();

console.log("4. Ask for a number until it’s greater than 50");
let num4;
do {
  num4 = Number(await inputPrompt("Give me a number greater than 50: "));
} while (num4 <= 50);
console.log(`${num4} is greater than 50.`);
console.log();

console.log("5. Check if a number is even or odd");
let num5 = Number(await inputPrompt("Give me a number to check if it is even or odd: "));
if (num5 % 2) {
  console.log("Odd");
} else {
  console.log("Even");
}
console.log();

console.log("6. Multiplication table");
let num6 = Number(await inputPrompt("Give me a number to print it's multiplication table: "));
if (num6 > 0 && num6 < 11) {
  for (let i = 1; i < 11; i++) {
    console.log(i * num6);
  }
}
console.log();

console.log("7. Count down from 10 to 1");
for (let i = 10; i > 0; i--) {
  console.log(i);
}
console.log("Done!");
console.log();

console.log("8. Simple grading system");
let score = Number(await inputPrompt("Enter a score from 0 to 100: "));
if (score >= 90 && score <= 100) {
  console.log("A");
} else if (score >= 80 && score < 90) {
  console.log("B");
} else if (score >= 70 && score < 80) {
  console.log("C");
} else if (score >= 60 && score < 70) {
  console.log("D");
} else if (score >= 0 && score < 60) {
  console.log("F");
} else {
  console.log("Invalid score. Please enter a number between 0 and 100.");
}
