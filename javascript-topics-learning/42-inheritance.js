// Topic 42: Inheritance

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

class Animal {
  speak() {
    console.log('Animal sound');
  }
}
class Dog extends Animal {
  speak() {
    console.log('Bark');
  }
}
new Dog().speak();
