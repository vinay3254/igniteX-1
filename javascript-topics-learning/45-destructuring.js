// Topic 45: Destructuring

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

const user = { name: 'Vinay', age: 21 };
const { name, age } = user;
const nums = [10, 20, 30];
const [a, b] = nums;
console.log(name, age, a, b);
