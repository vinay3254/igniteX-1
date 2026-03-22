// Topic 35: Nested functions

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

function outer(a) {
  function inner(b) {
    return a + b;
  }
  return inner(5);
}
console.log(outer(10));
