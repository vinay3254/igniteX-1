// Topic 07: Type conversion

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

const numStr = '123';
const num = Number(numStr);
const boolFromNum = Boolean(num);
const strAgain = String(num);
console.log(num, boolFromNum, strAgain);
