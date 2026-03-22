// Topic 36: Closures

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

function counter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}
const inc = counter();
console.log(inc(), inc(), inc());
