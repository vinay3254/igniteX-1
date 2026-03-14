// Topic 06: Accepting user input (prompt)

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

// Browser only: prompt()
// const user = prompt('Enter your name');
// console.log(`Hello, ${user}`);

// Node.js alternative using arguments:
const user = process.argv[2] ?? 'Guest';
console.log(`Hello, ${user}`);
