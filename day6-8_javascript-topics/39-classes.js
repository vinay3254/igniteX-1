// Topic 39: Classes

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

class User {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    console.log(`Hi, ${this.name}`);
  }
}
new User('Vinay').sayHi();
