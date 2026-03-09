// Even or Odd
let num = 10;
if (num % 2 === 0) {
    document.getElementById("evenOdd").innerText = num + " is Even";
} else {
    document.getElementById("evenOdd").innerText = num + " is Odd";
}

// Voting Eligibility
let age = 20;
if (age >= 18) {
    document.getElementById("vote").innerText = "Eligible to Vote";
} else {
    document.getElementById("vote").innerText = "Not Eligible to Vote";
}

// Grade Calculator
let marks = 85;
let grade;

if (marks >= 90) {
    grade = "A";
} else if (marks >= 75) {
    grade = "B";
} else if (marks >= 50) {
    grade = "C";
} else {
    grade = "Fail";
}

document.getElementById("grade").innerText = "Grade: " + grade;

// Positive, Negative or Zero
let number = -5;

if (number > 0) {
    document.getElementById("numberType").innerText = "Positive Number";
} else if (number < 0) {
    document.getElementById("numberType").innerText = "Negative Number";
} else {
    document.getElementById("numberType").innerText = "Zero";
}

// Switch Statement (Day)
let day = 3;
let dayName;

switch (day) {
    case 1: dayName = "Monday"; break;
    case 2: dayName = "Tuesday"; break;
    case 3: dayName = "Wednesday"; break;
    case 4: dayName = "Thursday"; break;
    case 5: dayName = "Friday"; break;
    case 6: dayName = "Saturday"; break;
    case 7: dayName = "Sunday"; break;
    default: dayName = "Invalid Day";
}

document.getElementById("day").innerText = "Day: " + dayName;