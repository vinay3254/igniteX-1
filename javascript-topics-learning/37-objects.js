// Topic 37: Objects

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

const user = {
  name: 'Vinay',
  age: 21,
  greet() {
    console.log(`Hi, I am ${this.name}`);
  }
};
user.greet();
