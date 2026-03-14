// Topic 41: Static keyword

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

class MathUtil {
  static square(n) {
    return n * n;
  }
}
console.log(MathUtil.square(9));
