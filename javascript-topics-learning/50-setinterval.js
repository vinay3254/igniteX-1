// Topic 50: setInterval()

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

let count = 0;
const id = setInterval(() => {
  count++;
  console.log('tick', count);
  if (count === 3) clearInterval(id);
}, 1000);
