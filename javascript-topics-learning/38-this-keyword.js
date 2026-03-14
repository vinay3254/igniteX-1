// Topic 38: this keyword

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

const car = {
  brand: 'Tesla',
  showBrand() {
    console.log(this.brand);
  }
};
car.showBrand();
