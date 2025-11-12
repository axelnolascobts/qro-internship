// Q1
function factorial(number) {
    number -= 1;
    let final_num = 1;
    while (number > 0) {
        final_num += (final_num * number);
        number--;
    }
    return final_num;
};
console.log(`Factorial: ${factorial(7)}`);

// Q2
function prime(number) {
    for (let i = 10; i > 1; i--) {
        if (number % i) {
            return false;
        }
    }
    return true;
};
console.log(`Prime: ${prime(2)}`);

// Q3
function biggest(array) {
    let prev = 0;
    let big = 0;
    for (let i = array.length; i >= 0; i--) {
        if (array[i] > prev) {
            big = array[i];
        }
        prev = array[i];
    }
    return big;
};
const array = [1, 10, 4, 3];
console.log(`Biggest Number: ${biggest(array)}`);

// Q4
function vowels(string) {
    let i = 0;
    let count = 0;
    while (i < string.length) {
        if (string[i] === "a" || string[i] === "e" || string[i] === "i" || string[i] === "o" || string[i] === "u") {
            count++;
        };
        if (string[i] === "A" || string[i] === "E" || string[i] === "I" || string[i] === "O" || string[i] === "U") {
            count++;
        };
        i++;
    };
    return count;
};
let str = "HelloU"
console.log(`Vowels: ${vowels(str)}`);

// Q5
function backwards(string) {
    let main_storage = [];
    for (let i = string.length; i >= 0; i--) {
        main_storage.push(string[i]);
    }

    return main_storage.join("");
};
console.log(`Backwards: ${backwards(str)}`);

// Q6
function palindrome(string) {
    let comparison = backwards(string);

    for (let i = string.length; i >= 0; i--) {
        if (string[i] !== comparison[i]) {
            return false;
        }
    }
    return true;
};
let test1 = "mom";
let test2 = "moo";
console.log(`Palindrome: ${palindrome(test1)}`);
console.log(`Palindrome: ${palindrome(test2)}`);