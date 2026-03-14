// Topic 13: Method chaining

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

const value = '  hello world  ';
const result = value.trim().toUpperCase().replace('WORLD', 'JS');
console.log(result);
