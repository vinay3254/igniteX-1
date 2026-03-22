// Topic 44: Getters & setters

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

class Rectangle {
  constructor(w, h) {
    this.w = w;
    this.h = h;
  }
  get area() {
    return this.w * this.h;
  }
  set width(value) {
    if (value > 0) this.w = value;
  }
}
const r = new Rectangle(4, 5);
console.log(r.area);
r.width = 10;
console.log(r.area);
