# Chapter 1: Introduction to TypeScript

> Understanding why TypeScript exists, how it works, and why modern developers use it.

---

# Table of Contents

- [1. What is TypeScript?](#1-what-is-typescript)
- [2. Why TypeScript Was Created](#2-why-typescript-was-created)
- [3. Problems With JavaScript](#3-problems-with-javascript)
- [4. TypeScript vs JavaScript](#4-typescript-vs-javascript)
- [5. How TypeScript Works](#5-how-typescript-works)
- [6. Compile Time vs Runtime](#6-compile-time-vs-runtime)
- [7. Static Typing](#7-static-typing)
- [8. Type Inference](#8-type-inference)
- [9. Type Erasure](#9-type-erasure)
- [10. Runtime Validation](#10-runtime-validation)
- [11. What TypeScript Can and Cannot Catch](#11-what-typescript-can-and-cannot-catch)
- [12. Real World Example](#12-real-world-example)
- [13. Interview Questions](#13-interview-questions)
- [14. Key Takeaways](#14-key-takeaways)

---

# 1. What is TypeScript?

TypeScript is a **superset of JavaScript** developed by Microsoft.

It adds:

- Static typing
- Interfaces
- Generics
- Type checking
- Better tooling

Any valid JavaScript code is also valid TypeScript.

Example:

JavaScript:

```javascript
function add(a, b) {
    return a + b;
}
```

The problem:

```javascript
add(10, "20");
```

Output:

```
1020
```

JavaScript allows this because it is dynamically typed.

---

TypeScript:

```typescript
function add(a: number, b: number): number {
    return a + b;
}
```

Now:

```typescript
add(10, "20");
```

Compiler error:

```
Argument of type 'string' is not assignable to parameter of type 'number'
```

TypeScript catches the mistake before running the program.

---

# 2. Why TypeScript Was Created

JavaScript was created in 1995 for small browser scripts.

Originally, JavaScript was designed for:

- Form validation
- Simple animations
- Small interactions

Example:

```javascript
button.onclick = function(){
    alert("Hello");
}
```

But modern applications became much larger.

Today JavaScript powers:

- Frontend applications
- Backend APIs
- Mobile apps
- Desktop apps
- Cloud systems

Examples:

- React applications
- Angular applications
- Node.js servers
- Electron applications

Large applications introduced problems:

- Difficult debugging
- Runtime errors
- Poor code navigation
- Hard refactoring

Microsoft created TypeScript in 2012 to solve these problems.

---

# 3. Problems With JavaScript

## 3.1 Dynamic Typing

JavaScript determines types during runtime.

Example:

```javascript
let age = 20;

age = "twenty";
```

JavaScript allows this.

The variable changed from:

```
number → string
```

without warning.

---

## 3.2 Runtime Errors

Example:

```javascript
function calculate(price){
    return price * 2;
}


calculate("100");
```

JavaScript converts:

```
"100" * 2
```

into:

```
200
```

Sometimes this behavior creates unexpected bugs.

---

## 3.3 Large Codebases Become Hard

Imagine:

```
1000 developers
10 million lines of code
5000 functions
```

Without types:

- What arguments does this function accept?
- What does this function return?
- Can this value be null?

Developers need answers.

TypeScript provides those answers.

---

# 4. TypeScript vs JavaScript

| Feature | JavaScript | TypeScript |
|-|-|-|
| Typing | Dynamic | Static |
| Compilation | No | Yes |
| Type Checking | Runtime | Compile time |
| Interfaces | No | Yes |
| Generics | No | Yes |
| Browser Support | Direct | Requires compilation |
| Error Detection | Later | Earlier |

---

# 5. How TypeScript Works

Important:

Browsers cannot execute TypeScript.

They understand only JavaScript.

Flow:

```
TypeScript File
      |
      |
      v
 TypeScript Compiler
      |
      |
      v
 JavaScript File
      |
      |
      v
 Browser / Node.js
```

Example:

Input:

```typescript
const message: string = "Hello";
```

Compiler output:

```javascript
const message = "Hello";
```

The type disappears.

---

# 6. Compile Time vs Runtime

This is one of the most important TypeScript concepts.

## Compile Time

Happens before execution.

Example:

```typescript
let age: number = "hello";
```

TypeScript:

```
Error:
Type 'string' is not assignable to type 'number'
```

Program does not compile successfully.

---

## Runtime

Happens when the program is running.

Example:

```typescript
const response = await fetch("/api/user");

const user = await response.json();
```

TypeScript cannot know what the server sends.

The API may return:

```json
{
    "name": 100
}
```

instead of:

```json
{
    "name": "John"
}
```

TypeScript cannot prevent this.

---

# 7. Static Typing

Static typing means:

> Types are checked before the program runs.

Example:

```typescript
let username: string;

username = "Alex";
```

Valid.

```typescript
username = 100;
```

Invalid.

---

Dynamic typing:

```javascript
let username = "Alex";

username = 100;
```

Allowed.

---

# 8. Type Inference

TypeScript does not require writing types everywhere.

It can automatically understand types.

Example:

```typescript
let age = 25;
```

TypeScript understands:

```typescript
let age: number;
```

Because the initial value is a number.

---

Another example:

```typescript
const name = "John";
```

Inference:

```typescript
const name: "John";
```

---

Good TypeScript code uses inference when possible.

Avoid:

```typescript
let age: number = 25;
```

Usually:

```typescript
let age = 25;
```

is enough.

---

# 9. Type Erasure

A very important concept:

> TypeScript types do not exist at runtime.

Example:

TypeScript:

```typescript
function greet(name: string){
    return name;
}
```

Compiled JavaScript:

```javascript
function greet(name){
    return name;
}
```

The type:

```typescript
:string
```

is removed.

---

Therefore:

TypeScript protects:

```
Developer mistakes
```

but not:

```
External unknown data
```

---

# 10. Runtime Validation

Since types disappear, external data must be validated.

Example:

API response:

```typescript
const user = await response.json();
```

TypeScript assumption:

```typescript
interface User {
    id:number;
    name:string;
}
```

But runtime data may be:

```json
{
    "id":"abc",
    "name":100
}
```

TypeScript cannot detect this.

Solutions:

- Zod
- Joi
- Yup
- class-validator

Example using validation:

```
External Data
      |
      v
 Runtime Validator
      |
      v
 Trusted TypeScript Object
```

---

# 11. What TypeScript Can and Cannot Catch

## TypeScript Can Catch

✅ Wrong function arguments

```typescript
function login(id:number){}

login("abc");
```

---

✅ Missing properties

```typescript
interface User {
    name:string;
}

const user:{} = {};
```

---

✅ Wrong return types

```typescript
function getAge():number{
    return "20";
}
```

---

## TypeScript Cannot Catch

❌ Wrong API response

❌ Database corruption

❌ User input mistakes

❌ Network failures

❌ Business logic errors

Example:

```typescript
function discount(price:number){
    return price - 500;
}
```

TypeScript accepts it.

But:

```
price = 100
discount = -400
```

is a business mistake.

---

# 12. Real World Example

Without TypeScript:

```javascript
function createUser(user){
    console.log(user.name);
}

createUser({
    username:"Alex"
});
```

Runtime:

```
undefined
```

---

With TypeScript:

```typescript
interface User {
    name:string;
}

function createUser(user:User){
    console.log(user.name);
}


createUser({
    username:"Alex"
});
```

Compiler:

```
Property 'name' is missing
```

---

# 13. Interview Questions

## Q1. Is TypeScript a programming language?

Answer:

Yes.

TypeScript is a programming language that extends JavaScript with static typing.

---

## Q2. Does TypeScript run in the browser?

Answer:

No.

Browsers run JavaScript.

TypeScript must be compiled into JavaScript.

---

## Q3. If TypeScript has types, why do we need runtime validation?

Answer:

Because TypeScript types disappear after compilation.

External data sources are unknown.

Examples:

- APIs
- Databases
- User input

---

## Q4. What bugs cannot TypeScript prevent?

Answer:

TypeScript cannot prevent:

- Incorrect business logic
- Wrong API data
- Runtime failures
- Server errors
- User mistakes

---

## Q5. Where do you draw the boundary between TypeScript and runtime validation?

Answer:

TypeScript handles:

```
Your code
```

Runtime validation handles:

```
Outside world data
```

---

# 14. Key Takeaways

- TypeScript is JavaScript with a type system.
- TypeScript improves developer productivity.
- Types exist only during development.
- TypeScript is removed during compilation.
- JavaScript runs at runtime.
- TypeScript catches many bugs before execution.
- Runtime validation is still required for external data.
- Use inference instead of unnecessary annotations.
- Strong TypeScript projects combine:
  - Static typing
  - Runtime validation
  - Good architecture

---

# End of Chapter 1