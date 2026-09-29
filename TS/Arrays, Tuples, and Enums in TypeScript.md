# Chapter 4: Arrays, Tuples, and Enums in TypeScript

> Understanding how TypeScript handles collections of values and fixed structured data.

---

# Table of Contents

- [1. Introduction](#1-introduction)
- [2. Arrays in TypeScript](#2-arrays-in-typescript)
- [3. Array Type Syntax](#3-array-type-syntax)
- [4. Array Type Inference](#4-array-type-inference)
- [5. Readonly Arrays](#5-readonly-arrays)
- [6. Multidimensional Arrays](#6-multidimensional-arrays)
- [7. Tuples](#7-tuples)
- [8. Tuple Operations](#8-tuple-operations)
- [9. Readonly Tuples](#9-readonly-tuples)
- [10. Enums](#10-enums)
- [11. Numeric Enums](#11-numeric-enums)
- [12. String Enums](#12-string-enums)
- [13. Const Enums](#13-const-enums)
- [14. Arrays vs Tuples](#14-arrays-vs-tuples)
- [15. Interview Questions](#15-interview-questions)
- [16. Key Takeaways](#16-key-takeaways)

---

# 1. Introduction

In real applications, we rarely work with single values.

We work with:

- Lists of users
- Product collections
- API responses
- Coordinates
- Configuration values
- Application states

TypeScript provides:

- Arrays
- Tuples
- Enums

to handle structured data safely.

---

# 2. Arrays in TypeScript

An array stores multiple values of the same type.

Example:

```typescript
let numbers:number[] = [1,2,3,4];
```

Meaning:

```
numbers
 |
 ├── number
 ├── number
 ├── number
 └── number
```

---

Invalid:

```typescript
let numbers:number[] = [1,2,"hello"];
```

Error:

```
Type 'string' is not assignable to type 'number'
```

---

# 3. Array Type Syntax

TypeScript supports two syntaxes.

---

## Method 1: Type followed by []

Example:

```typescript
let names:string[] = [
    "Alex",
    "John",
    "Mike"
];
```

Most commonly used.

---

## Method 2: Generic Array Syntax

Example:

```typescript
let names:Array<string> = [
    "Alex",
    "John"
];
```

Equivalent:

```typescript
string[]
```

---

For objects:

```typescript
let users:Array<User>;
```

is common in complex projects.

---

# 4. Array Type Inference

TypeScript automatically detects array types.

Example:

```typescript
let numbers = [1,2,3];
```

TypeScript infers:

```typescript
number[]
```

---

Example:

```typescript
let names = [
    "Alex",
    "John"
];
```

Inference:

```typescript
string[]
```

---

Mixed arrays:

```typescript
let values = [
    10,
    "hello"
];
```

Inference:

```typescript
(number | string)[]
```

Meaning:

```
Array containing number OR string
```

---

# 5. Readonly Arrays

Sometimes arrays should not be modified.

Example:

```typescript
const numbers:readonly number[] = [
    1,
    2,
    3
];
```

Now:

```typescript
numbers.push(4);
```

Error:

```
Property 'push' does not exist
```

---

Alternative syntax:

```typescript
ReadonlyArray<number>
```

Example:

```typescript
let users:ReadonlyArray<string>;
```

---

# 6. Multidimensional Arrays

Arrays can contain other arrays.

Example:

```typescript
let matrix:number[][] = [

    [1,2],

    [3,4]

];
```

Structure:

```
matrix

[
 [1,2],
 [3,4]
]

number[][]
```

---

Example:

3D array:

```typescript
let cube:number[][][] = [];
```

---

# 7. Tuples

A tuple is an array with:

- Fixed length
- Fixed order
- Different types allowed

Example:

```typescript
let user:[string,number] = [
    "Alex",
    25
];
```

Meaning:

Position:

```
0 → string
1 → number
```

---

Invalid:

```typescript
let user:[string,number] = [
    25,
    "Alex"
];
```

Error.

---

# Tuple vs Array

Array:

```typescript
string[]
```

Means:

```
Any number of strings
```

Example:

```typescript
[
 "A",
 "B",
 "C"
]
```

---

Tuple:

```typescript
[string,number]
```

Means:

```
Exactly:

position 0 → string
position 1 → number
```

---

# 8. Tuple Operations

Example:

```typescript
let point:[number,number] = [
    10,
    20
];
```

Access:

```typescript
point[0];
```

Output:

```
10
```

---

Named tuple:

```typescript
let user:[
    name:string,
    age:number
] = [
    "Alex",
    22
];
```

Improves readability.

---

# Optional Tuple Elements

Example:

```typescript
let user:[
    string,
    number,
    boolean?
];
```

Valid:

```typescript
[
 "Alex",
 20
]
```

or:

```typescript
[
 "Alex",
 20,
 true
]
```

---

# Rest Elements in Tuple

Example:

```typescript
let numbers:[
    string,
    ...number[]
];
```

Valid:

```typescript
[
 "numbers",
 1,
 2,
 3,
 4
]
```

---

# 9. Readonly Tuples

Tuples can also be immutable.

Example:

```typescript
let point:
readonly [number,number]
=
[
10,
20
];
```

Cannot modify:

```typescript
point[0]=100;
```

Error.

---

# 10. Enums

Enum means:

> A collection of named constants.

Instead of:

```typescript
let status = 1;
```

we can write:

```typescript
enum Status {

    Pending,

    Approved,

    Rejected

}
```

Usage:

```typescript
let orderStatus:Status = Status.Pending;
```

---

Advantages:

Without enum:

```typescript
if(status===2)
```

Problem:

What does 2 mean?

With enum:

```typescript
if(status===Status.Approved)
```

Readable.

---

# 11. Numeric Enums

Default enum values are numbers.

Example:

```typescript
enum Direction {

    Up,

    Down,

    Left,

    Right

}
```

Generated values:

```
Up    = 0
Down  = 1
Left  = 2
Right = 3
```

---

Custom values:

```typescript
enum Status {

    Pending=10,

    Success=20,

    Failed=30

}
```

---

# 12. String Enums

String enums store text values.

Example:

```typescript
enum Role {

    Admin="ADMIN",

    User="USER",

    Guest="GUEST"

}
```

Usage:

```typescript
let role:Role = Role.Admin;
```

---

Generated JavaScript is easier to debug.

---

# 13. Const Enums

`const enum` removes runtime enum object.

Example:

```typescript
const enum Color {

    Red,

    Blue

}
```

Usage:

```typescript
let c = Color.Red;
```

Compiler replaces:

```javascript
let c = 0;
```

Benefits:

- Smaller output
- Better performance

---

# 14. Arrays vs Tuples

| Feature | Array | Tuple |
|-|-|-|
| Length | Dynamic | Fixed |
| Types | Usually same | Different allowed |
| Order | Flexible | Important |
| Usage | Collections | Structured data |

---

Example:

Array:

```typescript
string[]
```

Users:

```typescript
[
"Alex",
"John"
]
```

---

Tuple:

```typescript
[string,number]
```

User record:

```typescript
[
"Alex",
25
]
```

---

# 15. Interview Questions

## Q1. Difference between array and tuple?

Answer:

Array:

```
Same type, dynamic length
```

Tuple:

```
Fixed length, fixed order
```

---

## Q2. Can tuples contain different types?

Answer:

Yes.

Example:

```typescript
[string,number,boolean]
```

---

## Q3. Why use readonly arrays?

Answer:

To prevent accidental modification.

---

## Q4. What is enum?

Answer:

Enum creates named constants.

Example:

```typescript
enum Role {
Admin,
User
}
```

---

## Q5. Difference between string enum and numeric enum?

Numeric:

```typescript
Admin = 0
```

String:

```typescript
Admin = "ADMIN"
```

String enums are easier to debug.

---

## Q6. Should enums always be used?

Answer:

Not always.

Modern TypeScript projects often prefer:

- Union types
- `as const`

Example:

```typescript
type Status =
"pending" |
"success" |
"failed";
```

---

# 16. Key Takeaways

- Arrays store collections of values.
- TypeScript checks array element types.
- Type inference automatically detects arrays.
- Readonly arrays prevent modification.
- Tuples represent fixed structured data.
- Tuples can contain different types.
- Enums create named constants.
- String enums improve readability.
- Use enums carefully; union types are often preferred in modern TypeScript.

---

# End of Chapter 4