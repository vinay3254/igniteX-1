// Topic 27: Callbacks

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

function processUser(name, callback) {
  callback(`Hello, ${name}`);
}
processUser('Vinay', (message) => console.log(message));
