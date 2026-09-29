# Chapter 3: Basic Types in TypeScript

> Understanding TypeScript's built-in types, type annotations, type inference, and special types.

---

# Table of Contents

- [1. Introduction to Types](#1-introduction-to-types)
- [2. Type Annotations](#2-type-annotations)
- [3. Type Inference](#3-type-inference)
- [4. Primitive Types](#4-primitive-types)
  - number
  - string
  - boolean
  - null
  - undefined
  - symbol
  - bigint
- [5. Special Types](#5-special-types)
  - any
  - unknown
  - void
  - never
- [6. Type Annotation vs Type Inference](#6-type-annotation-vs-type-inference)
- [7. Interview Questions](#7-interview-questions)
- [8. Key Takeaways](#8-key-takeaways)

---

# 1. Introduction to Types

A type describes:

> What kind of value a variable can store.

Examples:

```typescript
let age:number = 25;

let username:string = "Alex";

let isActive:boolean = true;
```

TypeScript checks whether values match their types.

Example:

```typescript
let age:number;

age = "hello";
```

Error:

```
Type 'string' is not assignable to type 'number'
```

---

# 2. Type Annotations

A type annotation explicitly tells TypeScript the type of a value.

Syntax:

```typescript
let variableName: type = value;
```

Example:

```typescript
let price:number = 100;

let name:string = "John";

let status:boolean = true;
```

---

## Function Type Annotation

Example:

```typescript
function add(
    a:number,
    b:number
):number {

    return a+b;

}
```

Explanation:

```
a:number
    |
    └── parameter type


:number
    |
    └── return type
```

---

# 3. Type Inference

TypeScript can automatically understand types.

Example:

```typescript
let age = 25;
```

TypeScript infers:

```typescript
let age:number;
```

No need to write:

```typescript
let age:number = 25;
```

---

## How Inference Works

Example:

```typescript
const username = "Alex";
```

TypeScript knows:

```
username → string
```

Because:

```
"Alex"
 |
 v
string value
```

---

# 4. Primitive Types

Primitive types represent basic JavaScript values.

TypeScript supports:

- number
- string
- boolean
- null
- undefined
- symbol
- bigint

---

# 4.1 number

Represents all numeric values.

Example:

```typescript
let age:number = 25;

let price:number = 99.99;

let negative:number = -10;
```

JavaScript has only one number type.

Unlike languages like:

```
Java:
int
float
double
```

TypeScript:

```
number
```

---

Valid:

```typescript
let score:number = 100;

score = 200;
```

Invalid:

```typescript
score = "100";
```

---

# 4.2 string

Represents text values.

Example:

```typescript
let name:string = "John";
```

Strings can use:

```typescript
"double quotes"

'single quotes'

`template literals`
```

Example:

```typescript
let message:string =
`Hello ${name}`;
```

---

# 4.3 boolean

Represents true or false.

Example:

```typescript
let isLoggedIn:boolean = true;

let isAdmin:boolean = false;
```

Common usage:

```typescript
if(isLoggedIn){

    console.log("Welcome");

}
```

---

# 4.4 null

Represents intentional absence of a value.

Example:

```typescript
let user:null = null;
```

Meaning:

```
There is no value currently.
```

---

With strict mode:

```json
{
 "strict":true
}
```

null is separate from other types.

Example:

```typescript
let username:string = null;
```

Error:

```
Type 'null' is not assignable to type 'string'
```

---

# 4.5 undefined

Represents a value that has not been assigned.

Example:

```typescript
let value:undefined = undefined;
```

Example:

```typescript
let username:string | undefined;
```

Meaning:

```
username can be:

string
OR
undefined
```

---

# 4.6 symbol

Symbol creates unique values.

JavaScript example:

```typescript
const id = Symbol();
```

Each symbol is unique.

Example:

```typescript
const userId = Symbol("id");
```

Even:

```typescript
Symbol("id")
```

and

```typescript
Symbol("id")
```

are different.

---

Usage:

- Object keys
- Unique identifiers
- Library development

---

# 4.7 bigint

Used for very large integers.

Example:

```typescript
let bigNumber:bigint = 12345678901234567890n;
```

Normal number:

```typescript
number
```

Maximum safe integer:

```
9007199254740991
```

For larger values:

```
bigint
```

---

# 5. Special Types

TypeScript has special types:

- any
- unknown
- void
- never

---

# 5.1 any

`any` disables type checking.

Example:

```typescript
let value:any;

value = 10;

value = "hello";

value = true;
```

Everything is allowed.

---

Problem:

```typescript
let data:any = "hello";

data.toFixed();
```

TypeScript allows it.

Runtime:

```
Error
```

---

Avoid:

```typescript
any
```

unless necessary.

---

# 5.2 unknown

`unknown` is the safer alternative to `any`.

Example:

```typescript
let value:unknown;

value = "hello";

value = 10;
```

Allowed.

But:

```typescript
value.toUpperCase();
```

Error.

Why?

Because TypeScript does not know the actual type.

---

You must check first:

```typescript
if(typeof value === "string"){

    value.toUpperCase();

}
```

---

Difference:

| any | unknown |
|-|-|
| No checking | Requires checking |
| Unsafe | Safe |
| Avoid | Prefer |

---

# 5.3 void

Used for functions that return nothing.

Example:

```typescript
function logMessage():void{

    console.log("Hello");

}
```

The function returns:

```
undefined
```

---

Incorrect:

```typescript
function add():void{

    return 10;

}
```

Error.

---

# 5.4 never

Represents values that never occur.

Used when:

- Function never returns
- Infinite loop
- Always throws error

Example:

```typescript
function error(message:string):never{

    throw new Error(message);

}
```

Execution:

```
Function starts
       |
       v
Throws error
       |
       v
Never returns
```

---

Infinite loop:

```typescript
function infinite():never{

    while(true){

    }

}
```

---

# 6. Type Annotation vs Type Inference

## Type Annotation

Developer writes the type.

Example:

```typescript
let age:number = 20;
```

---

## Type Inference

Compiler detects the type.

Example:

```typescript
let age = 20;
```

TypeScript understands:

```typescript
age:number
```

---

## Best Practice

Prefer inference:

```typescript
const username = "Alex";
```

Use annotation when:

- Function parameters
- Complex objects
- Public APIs
- Empty variables

Example:

```typescript
let user:string;
```

---

# 7. Interview Questions

## Q1. Difference between any and unknown?

Answer:

`any` disables type checking.

`unknown` requires type checking before usage.

---

## Q2. What is type inference?

Answer:

TypeScript automatically determines variable types from values.

Example:

```typescript
let age = 20;
```

becomes:

```typescript
age:number
```

---

## Q3. Difference between void and never?

Answer:

void:

```
Function returns nothing.
```

never:

```
Function never completes.
```

---

## Q4. Why should we avoid any?

Answer:

Because it removes TypeScript's safety.

Example:

```typescript
let data:any;

data.invalidFunction();
```

No compile-time error.

---

## Q5. Is null a type?

Answer:

Yes.

TypeScript treats:

```
null
undefined
```

as separate types when strict mode is enabled.

---

# 8. Key Takeaways

- Types describe what values are allowed.
- Type annotations explicitly define types.
- Type inference automatically detects types.
- Primitive types represent basic values.
- `any` removes safety.
- `unknown` is safer than `any`.
- `void` represents no return value.
- `never` represents impossible completion.
- Prefer inference where possible.
- Use explicit types for important boundaries.

---

# End of Chapter 3