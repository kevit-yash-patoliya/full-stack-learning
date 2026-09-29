# Pure Functions in JavaScript

A pure function is a function that always produces the same output for the same input and does not cause observable side effects. This makes pure functions predictable, easier to test, and easier to reason about.

## Core Concepts

### Deterministic Output

- Given the same input, a pure function always returns the same result.
- It does not depend on external state such as global variables or mutable data.

### No Side Effects

- A pure function does not modify any external variable.
- It does not change the state of the program outside its own local scope.
- It does not perform actions like logging, network requests, or DOM updates.

### Referential Transparency

- A function call can be replaced with its evaluated result without changing program behavior.
- This makes code easier to reason about and optimize.

## Example of a Pure Function

```js
function add(a, b) {
  return a + b;
}
```

This function is pure because:

- it always returns the same result for the same inputs;
- it does not modify anything outside itself.

## Example of an Impure Function

```js
let counter = 0;

function increment() {
  counter += 1;
  return counter;
}
```

This function is impure because it changes external state through the `counter` variable.

## Why Pure Functions Matter

### Easier Testing

- No need to set up complex external state.
- Results can be verified by simple input-output checks.

### Better Debugging

- The function behavior is isolated and predictable.
- Problems are easier to trace.

### Safer Composition

- Pure functions can be combined more confidently.
- They are ideal for functional programming patterns.

<img src="./../../Images/Js_img/PF/Pure_functions.png">

## In Short

Pure functions are a foundational concept in functional programming. They improve predictability, make code easier to test, and help build more reliable software.
