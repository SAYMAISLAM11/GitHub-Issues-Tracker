1️⃣ Difference between var, let, and const

var: Function scoped, can be redeclared and updated.
let: Block scoped, cannot be redeclared but can be updated.
const: Block scoped, cannot be redeclared or updated.

2️⃣ What is the spread operator (...)

The spread operator (...) is used to expand or copy elements of an array or object into another array or object.
Example:
const arr1 = [1,2,3];
const arr2 = [...arr1,4,5];
3️⃣ Difference between map(), filter(), and forEach()

map(): Creates a new array by transforming each element.
filter(): Creates a new array with elements that match a condition.
forEach(): Loops through an array but does not return a new array.

4️⃣ What is an arrow function

An arrow function is a shorter syntax for writing functions in JavaScript using =>.
Example:
const add = (a,b) => a + b;

5️⃣ What are template literals?

Template literals are strings written with backticks ( ) that allow embedding variables and expressions using ${}.
Example:
let name = "John";
console.log(`Hello ${name}`);