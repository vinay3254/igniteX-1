// Topic 47: Array of objects

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

const users = [
  { id: 1, name: 'Asha' },
  { id: 2, name: 'Rahul' }
];
console.log(users.map(u => u.name));
