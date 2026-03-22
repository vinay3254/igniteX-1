// Topic 10: Random numbers

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

// Random integer between min and max (inclusive)
const min = 1, max = 6;
const random = Math.floor(Math.random() * (max - min + 1)) + min;
console.log('Dice roll:', random);
