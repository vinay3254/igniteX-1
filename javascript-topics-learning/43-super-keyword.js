// Topic 43: Super keyword

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

class Person {
  constructor(name) {
    this.name = name;
  }
}
class Employee extends Person {
  constructor(name, role) {
    super(name);
    this.role = role;
  }
}
console.log(new Employee('Riya', 'Developer'));
