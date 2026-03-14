// Topic 31: reduce() method

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

const nums = [10, 20, 30];
const total = nums.reduce((sum, n) => sum + n, 0);
console.log(total);
