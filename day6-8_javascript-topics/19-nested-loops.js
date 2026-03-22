// Topic 19: Nested loops

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

for (let row = 1; row <= 3; row++) {
  let line = '';
  for (let col = 1; col <= 3; col++) line += col + ' ';
  console.log(line.trim());
}
