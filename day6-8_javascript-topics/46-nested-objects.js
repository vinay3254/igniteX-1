// Topic 46: Nested objects

// How it works:
// 1) Run this file with Node.js (or read line by line).
// 2) Observe the output in the console.
// 3) Change values and rerun to understand behavior.

const student = {
  name: 'Aman',
  address: { city: 'Bhubaneswar', pin: 751001 }
};
console.log(student.address.city);
