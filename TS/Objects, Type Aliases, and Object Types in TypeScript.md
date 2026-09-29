# Chapter 5: Objects & Type Aliases in TypeScript

> Understanding how TypeScript describes objects, creates reusable types, and models complex data structures.

---

# Table of Contents

- [1. Introduction to Object Types](#1-introduction-to-object-types)
- [2. Object Type Annotations](#2-object-type-annotations)
- [3. Object Type Inference](#3-object-type-inference)
- [4. Optional Properties](#4-optional-properties)
- [5. Readonly Properties](#5-readonly-properties)
- [6. Nested Object Types](#6-nested-object-types)
- [7. Type Aliases](#7-type-aliases)
- [8. Type Alias with Objects](#8-type-alias-with-objects)
- [9. Type Alias Reusability](#9-type-alias-reusability)
- [10. Object Type vs Type Alias](#10-object-type-vs-type-alias)
- [11. Structural Typing](#11-structural-typing)
- [12. Interview Questions](#12-interview-questions)
- [13. Key Takeaways](#13-key-takeaways)

---

# 1. Introduction to Object Types

Most real-world applications work with objects.

Examples:

- Users
- Products
- Orders
- API responses
- Configuration objects

JavaScript:

```javascript
const user = {
    name:"Alex",
    age:25
};
```

JavaScript does not define the structure.

TypeScript allows us to describe the structure.

---

# 2. Object Type Annotations

We can define object types directly.

Example:

```typescript
let user:{
    name:string;
    age:number;
};


user = {
    name:"Alex",
    age:25
};
```

TypeScript understands:

```
user

name → string
age  → number
```

---

Invalid:

```typescript
user = {
    name:100,
    age:"Alex"
};
```

Error:

```
Type 'number' is not assignable to type 'string'
```

---

# Object Property Syntax

Object types use:

```typescript
{
    propertyName: type;
}
```

Example:

```typescript
let product:{
    id:number;
    title:string;
    price:number;
};
```

---

# 3. Object Type Inference

TypeScript can automatically infer object types.

Example:

```typescript
const user = {
    name:"Alex",
    age:25
};
```

TypeScript creates:

```typescript
{
    name:string;
    age:number;
}
```

---

You don't need:

```typescript
const user:{
    name:string;
    age:number;
} = {
    name:"Alex",
    age:25
};
```

Inference is enough.

---

# 4. Optional Properties

Sometimes objects may have optional fields.

Example:

```typescript
let user:{
    name:string;
    age:number;
    email?:string;
};
```

`?` means:

```
Property may exist or may not exist.
```

---

Valid:

```typescript
{
    name:"Alex",
    age:25
}
```

Also valid:

```typescript
{
    name:"Alex",
    age:25,
    email:"alex@gmail.com"
}
```

---

Without optional:

```typescript
email:string;
```

Email becomes required.

---

# Optional Property Usage

Example:

```typescript
function printUser(user:{
    name:string;
    email?:string;
}){

    console.log(user.name);

}
```

---

Checking optional values:

```typescript
if(user.email){

    console.log(user.email);

}
```

---

# 5. Readonly Properties

Readonly properties cannot be changed after initialization.

Example:

```typescript
let user:{
    readonly id:number;
    name:string;
};


user = {
    id:1,
    name:"Alex"
};
```

---

Allowed:

```typescript
user.name="John";
```

Not allowed:

```typescript
user.id=2;
```

Error:

```
Cannot assign to 'id'
because it is a read-only property
```

---

Common usage:

- Database IDs
- UUIDs
- Configuration values

---

# 6. Nested Object Types

Objects can contain other objects.

Example:

```typescript
let user:{
    name:string;

    address:{
        city:string;
        country:string;
    };
};
```

Valid:

```typescript
user = {

    name:"Alex",

    address:{
        city:"Rajkot",
        country:"India"
    }

};
```

---

Structure:

```
User

 |
 +-- name : string
 |
 +-- address
        |
        +-- city : string
        |
        +-- country : string
```

---

# 7. Type Aliases

Writing large object types repeatedly is difficult.

Example:

```typescript
let user1:{
    name:string;
    age:number;
};


let user2:{
    name:string;
    age:number;
};
```

Duplicate code.

Solution:

Type Alias.

---

Syntax:

```typescript
type TypeName = Type;
```

Example:

```typescript
type User = {

    name:string;

    age:number;

};
```

Now:

```typescript
let user:User;
```

---

# 8. Type Alias with Objects

Example:

```typescript
type Product = {

    id:number;

    name:string;

    price:number;

};
```

Usage:

```typescript
const product:Product = {

    id:1,

    name:"Laptop",

    price:50000

};
```

---

# Type Alias with Functions

Types can describe functions.

Example:

```typescript
type Add = (
    a:number,
    b:number
)=>number;
```

Usage:

```typescript
const add:Add = (a,b)=>{

    return a+b;

};
```

---

# 9. Type Alias Reusability

Large projects use aliases everywhere.

Example:

```typescript
type User = {

    id:number;

    name:string;

    email:string;

};
```

API:

```typescript
function getUser():User{

    return {

        id:1,

        name:"Alex",

        email:"alex@gmail.com"

    };

}
```

---

Benefits:

- Less repetition
- Better readability
- Easier maintenance

---

# 10. Object Type vs Type Alias

## Object Type

Directly written:

```typescript
let user:{
    name:string;
    age:number;
};
```

Good for:

- Small objects
- Local usage

---

## Type Alias

Reusable:

```typescript
type User = {

    name:string;

    age:number;

};
```

Good for:

- Large applications
- Shared models
- APIs

---

# 11. Structural Typing

TypeScript uses structural typing.

Meaning:

> Type compatibility is based on structure, not name.

Example:

```typescript
type User = {

    name:string;

    age:number;

};


type Employee = {

    name:string;

    age:number;

};
```

Even though names differ:

```typescript
let user:User;

let employee:Employee;


employee = user;
```

Allowed.

Because both have:

```
name:string
age:number
```

---

Diagram:

```
User

name:string
age:number


Employee

name:string
age:number


      |
      |
      v

Same Structure

Compatible
```

---

# 12. Interview Questions

## Q1. What is a type alias?

Answer:

A type alias creates a custom name for a type.

Example:

```typescript
type User={
    name:string;
};
```

---

## Q2. Difference between interface and type?

Answer:

Both can describe object structures.

Type aliases can additionally represent:

- unions
- primitives
- tuples
- functions

Example:

```typescript
type ID = string | number;
```

---

## Q3. What does optional property mean?

Answer:

Property may or may not exist.

Example:

```typescript
email?:string
```

---

## Q4. What is readonly?

Answer:

Prevents modification after initialization.

Example:

```typescript
readonly id:number;
```

---

## Q5. What is structural typing?

Answer:

TypeScript checks compatibility based on object structure.

Not based on type names.

---

# 13. Key Takeaways

- Objects represent real-world entities.
- Object types define object structure.
- Type inference automatically understands objects.
- Optional properties use `?`.
- Readonly properties prevent modification.
- Nested objects model complex data.
- Type aliases create reusable types.
- TypeScript uses structural typing.
- Large applications should use reusable types.

---

# End of Chapter 5