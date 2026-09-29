# Chapter 2: TypeScript Configuration

> Understanding how TypeScript compiler settings control your project.

---

# Table of Contents

- [1. What is tsconfig.json?](#1-what-is-tsconfigjson)
- [2. Why tsconfig.json is Important](#2-why-tsconfigjson-is-important)
- [3. Creating a TypeScript Configuration](#3-creating-a-typescript-configuration)
- [4. Compiler Options](#4-compiler-options)
- [5. target Option](#5-target-option)
- [6. module Option](#6-module-option)
- [7. Default TypeScript Configuration](#7-default-typescript-configuration)
- [8. Behavior Without tsconfig.json](#8-behavior-without-tsconfigjson)
- [9. TypeScript Compiler Pipeline](#9-typescript-compiler-pipeline)
- [10. Important Compiler Options](#10-important-compiler-options)
- [11. include and exclude](#11-include-and-exclude)
- [12. rootDir and outDir](#12-rootdir-and-outdir)
- [13. strict Mode](#13-strict-mode)
- [14. Source Maps](#14-source-maps)
- [15. Interview Questions](#15-interview-questions)
- [16. Key Takeaways](#16-key-takeaways)

---

# 1. What is tsconfig.json?

`tsconfig.json` is the configuration file used by the TypeScript compiler.

It defines:

- How TypeScript should compile files
- Which JavaScript version to generate
- Which module system to use
- Which files should be included
- Type checking rules

Example:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true
  }
}
```

---

# 2. Why tsconfig.json is Important

Without configuration:

```bash
tsc app.ts
```

TypeScript uses default settings.

In real projects, relying on defaults is not recommended.

A team should clearly define:

- Target JavaScript version
- Module system
- Strictness level
- Output location

Example:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true
  }
}
```

Now every developer understands the project behavior.

---

# 3. Creating a TypeScript Configuration

Create automatically:

```bash
tsc --init
```

This generates:

```
tsconfig.json
```

Example generated file:

```json
{
  "compilerOptions": {
    
  }
}
```

---

# 4. Compiler Options

Compiler options control TypeScript behavior.

Structure:

```json
{
  "compilerOptions": {

  }
}
```

Common options:

| Option | Purpose |
|-|-|
| target | JavaScript version output |
| module | Module system |
| strict | Type checking rules |
| outDir | Output folder |
| rootDir | Source folder |
| sourceMap | Debugging |
| esModuleInterop | Module compatibility |

---

# 5. target Option

## What is target?

`target` decides which JavaScript version TypeScript generates.

Example:

Input TypeScript:

```typescript
const add = (a:number,b:number) => a+b;
```

---

## Target ES2022

Configuration:

```json
{
 "compilerOptions":{
    "target":"ES2022"
 }
}
```

Output:

```javascript
const add = (a,b)=>a+b;
```

Modern syntax is preserved.

---

## Target ES5

Configuration:

```json
{
 "compilerOptions":{
    "target":"ES5"
 }
}
```

Output:

```javascript
var add = function(a,b){
    return a+b;
};
```

Arrow functions are converted.

---

# 6. module Option

`module` controls how JavaScript modules are generated.

Example:

TypeScript:

```typescript
export function hello(){

}
```

---

## CommonJS

Configuration:

```json
{
 "compilerOptions":{
    "module":"CommonJS"
 }
}
```

Output:

```javascript
exports.hello = hello;
```

Used commonly in:

- Node.js projects

---

## ES Modules

Configuration:

```json
{
 "compilerOptions":{
    "module":"ESNext"
 }
}
```

Output:

```javascript
export function hello(){

}
```

Used in:

- Modern frontend applications

---

# 7. Default TypeScript Configuration

Important interview topic.

Suppose:

```json
{
 "compilerOptions":{

 }
}
```

No target.

No module.

What happens?

TypeScript uses default compiler settings.

---

## Default target

Historically:

```
ES3
```

Old TypeScript versions emitted ES3.

Modern TypeScript versions no longer support ES3.

Effective default:

```
ES5
```

---

Example:

TypeScript:

```typescript
const x = 10;
```

Output:

```javascript
var x = 10;
```

because ES5 does not support `const`.

---

## Default module

The default module behavior depends on target and compiler version.

For common default compilation:

```
target: ES5
module: CommonJS
```

---

# 8. Behavior Without tsconfig.json

Example:

Project:

```
project/
 |
 └── app.ts
```

Command:

```bash
tsc app.ts
```

What happens?

TypeScript:

1. Searches for tsconfig.json
2. Does not find one
3. Uses default compiler options
4. Compiles only the specified file

---

Approximate behavior:

```json
{
 "target":"ES5",
 "module":"CommonJS",
 "strict":false,
 "sourceMap":false
}
```

---

# 9. TypeScript Compiler Pipeline

```
        app.ts
          |
          |
          v
+--------------------+
| TypeScript Compiler|
|       tsc          |
+--------------------+
          |
          |
          v
 Reads tsconfig.json
          |
          |
          v
 Type Checking
          |
          |
          v
 JavaScript Output
          |
          |
          v
     app.js
```

---

# 10. Important Compiler Options

## strict

Enables strict checking.

Example:

```json
{
 "compilerOptions":{
    "strict":true
 }
}
```

Includes:

- strictNullChecks
- noImplicitAny
- strictFunctionTypes
- strictPropertyInitialization

Recommended for production.

---

# noImplicitAny

Without strict:

```typescript
function add(a,b){
    return a+b;
}
```

Allowed.

With:

```json
{
 "noImplicitAny":true
}
```

Error:

```
Parameter 'a' implicitly has an 'any' type
```

---

# 11. include and exclude

Controls files TypeScript compiles.

Example:

```json
{
 "include":[
    "src/**/*"
 ]
}
```

Meaning:

```
src
 |
 ├── app.ts
 ├── user.ts
 └── api.ts
```

All included.

---

Exclude:

```json
{
 "exclude":[
    "node_modules"
 ]
}
```

Avoid compiling dependencies.

---

# 12. rootDir and outDir

Example:

Project:

```
project

src
 |
 ├── app.ts
 └── user.ts

dist
```

Configuration:

```json
{
 "compilerOptions":{
    "rootDir":"src",
    "outDir":"dist"
 }
}
```

Output:

```
dist
 |
 ├── app.js
 └── user.js
```

---

# 13. Source Maps

Enable:

```json
{
 "compilerOptions":{
    "sourceMap":true
 }
}
```

Generates:

```
app.js
app.js.map
```

Purpose:

Debug TypeScript code directly.

Without source maps:

```
Debugger
   |
   v
JavaScript
```

With source maps:

```
Debugger
   |
   v
TypeScript
```

---

# 14. Real World Node.js Configuration

Example:

```json
{
 "compilerOptions":{

    "target":"ES2022",

    "module":"NodeNext",

    "strict":true,

    "rootDir":"src",

    "outDir":"dist",

    "sourceMap":true

 }
}
```

Meaning:

| Setting | Purpose |
|-|-|
| ES2022 | Modern JavaScript |
| NodeNext | Modern Node modules |
| strict | Safer code |
| src | Source files |
| dist | Generated files |
| sourceMap | Debugging |

---

# 15. Interview Questions

## Q1. What happens if target is not specified?

Answer:

TypeScript uses its default target.

Modern TypeScript behaves approximately like:

```
target = ES5
```

---

## Q2. Why does const become var?

Example:

Input:

```typescript
const x = 10;
```

Output:

```javascript
var x = 10;
```

Because target is ES5.

---

## Q3. Does tsconfig.json automatically compile every file?

No.

It depends on:

- include
- exclude
- files

---

## Q4. Difference between target and module?

target:

```
Which JavaScript version?
```

module:

```
How should imports/exports work?
```

---

## Q5. What happens if there is no tsconfig.json?

TypeScript:

- Uses defaults
- Compiles provided files only

Example:

```bash
tsc app.ts
```

---

# 16. Key Takeaways

- `tsconfig.json` controls TypeScript compilation.
- `target` decides JavaScript version.
- `module` decides module system.
- Without configuration TypeScript uses defaults.
- Modern projects should explicitly define settings.
- `strict:true` is recommended.
- `include` and `exclude` control compilation scope.
- Source maps improve debugging.
- Compiler options define project behavior.

---

# End of Chapter 2