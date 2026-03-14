// Topic 26: Rest parameters

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

function total(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}
console.log(total(1, 2, 3, 4));
