// Topic 40: Constructors

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

class Student {
  constructor(name, marks) {
    this.name = name;
    this.marks = marks;
  }
}
console.log(new Student('Asha', 92));
