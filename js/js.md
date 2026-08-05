
# JavaScript Notes

> Priority tags used throughout: 🔴 **Must-know** (interviews + daily use) · 🟡 **Important** (comes up often) · 🟢 **Good to know** (situational)

---

## 1) for...in vs for...of  🔴

- **What**: `for...in` iterates over **enumerable keys** (works on objects, also arrays but gives indices as strings). `for...of` iterates over **values** using the iterable protocol (arrays, strings, Maps, Sets, NodeLists).
- **Why**: Objects aren't iterable by default — `for...in` was built for keys. `for...of` was added in ES6 so you don't need `.length` / index juggling on arrays.
- **How**:
```js
const arr = [10, 20, 30];
for (const i in arr) console.log(i);     // "0","1","2" (string indices)
for (const v of arr) console.log(v);     // 10, 20, 30 (actual values)

const obj = { a: 1, b: 2 };
for (const key in obj) console.log(key); // "a","b"
// for (const v of obj)  ❌ TypeError — plain objects aren't iterable
```
- ⚠️ Avoid `for...in` on arrays — it also picks up inherited enumerable properties and index order isn't guaranteed by spec.

---

## 2) Arrow Functions  🔴

#### Why (2 main reasons)

**1. Lexical `this`** — arrow functions don't have their own `this`; they inherit it from the enclosing scope.
```js
class Timer {
  constructor() { this.seconds = 0; }
  start() {
    setInterval(function() {
      this.seconds++;              // ❌ 'this' = window/undefined here
      console.log(this.seconds);   // NaN
    }, 1000);
  }
}
```
Why this happens: `setInterval` calls the function as a plain function (no object before the dot), so `this` defaults to the global object (or `undefined` in strict mode) — not the `Timer` instance.
```js
class Timer {
  constructor() { this.seconds = 0; }
  start() {
    setInterval(() => {
      this.seconds++;              // ✅ 'this' = Timer instance
      console.log(this.seconds);   // 1, 2, 3...
    }, 1000);
  }
}
```

**2. Shorter syntax**
```js
const double = x => x * 2;
```

- 🟡 Arrow functions have **no `arguments` object**, **can't be used as constructors** (`new`), and have **no `prototype`** property.

---

## 3) Parameter Types  🔴

1. **Standard** — `function f(a, b) {}`
2. **Default** — `function f(a = 10) {}` (used when argument is `undefined`)
3. **Rest** — `function f(...args) {}` (collects remaining args into an array)
4. **Destructured** — `function f({name, age}) {}` or `function f([a, b]) {}`
5. **Callback** — a function passed as an argument, invoked later (`arr.map(fn)`)

```js
function greet(name = "Guest", ...rest) {
  console.log(name, rest);
}
greet();                    // "Guest" []
greet("Yash", 1, 2, 3);     // "Yash" [1, 2, 3]
```

---

## 4) Scopes & Execution Context  🔴

- **Types of scope**: functional, block, lexical (resolved by *where a function is written*, not where it's called).

### Execution Context
An abstract environment the JS engine creates to run code. Has two phases:
1. **Memory Creation phase** → variables/functions are allocated in memory (this is **hoisting**).
2. **Execution phase** → code runs line by line, values get assigned.

**Types**:
1. **Global Execution Context (GEC)** — created once when the script starts.
2. **Function Execution Context (FEC)** — created fresh every time a function is invoked.

### Lifecycle
> 1. Engine creates the Global Execution Context.
> 2. Engine scans the file for hoisting (registers global-scoped items), pushes GEC onto the **Call Stack**.
> 3. A function is invoked → engine creates an FEC, pushes it on top of the Call Stack.
> 4. Function looks for a variable → checks its own scope first (**Lexical Scope**).
> 5. Not found → moves outward to the enclosing scope, eventually Global Scope (this chain = **Scope Chain**).
> 6. Function finishes → its FEC pops off the Call Stack.

### 🔴 Hoisting (why it matters)
- **`var`**: hoisted and initialized with `undefined`.
- **`let` / `const`**: hoisted but **not initialized** → accessing before declaration throws `ReferenceError` (this gap is the **Temporal Dead Zone / TDZ**).
- **Function declarations**: hoisted fully (can call before defined). **Function expressions/arrow functions** assigned to `let`/`const` are NOT.
```js
console.log(a); // undefined
var a = 5;

console.log(b); // ❌ ReferenceError (TDZ)
let b = 5;
```

### 🔴 Closures
- **What**: a function "remembers" the variables from its lexical scope even after the outer function has finished executing.
- **Why**: enables data privacy, factory functions, currying, memoization.
- **How**:
```js
function counter() {
  let count = 0;
  return function() {
    return ++count; // closure over 'count'
  };
}
const inc = counter();
inc(); // 1
inc(); // 2 (count persisted!)
```

### 🔴 var vs let vs const
| Feature | `var` | `let` | `const` |
|---|---|---|---|
| Scope | function | block | block |
| Hoisting | initialized `undefined` | TDZ | TDZ |
| Re-declare | ✅ | ❌ | ❌ |
| Reassign | ✅ | ✅ | ❌ (object contents still mutable) |

---

## 5) Event Loop, Call Stack & Async  🔴

- **What**: JS is single-threaded — one Call Stack. Async work (timers, fetch, DOM events) is handed off to **Web APIs** (browser) or **libuv** (Node), and their callbacks come back through queues.
- **Two queues**:
  - **Microtask queue** — Promises (`.then`, `async/await`), `queueMicrotask`. Higher priority.
  - **Macrotask queue** — `setTimeout`, `setInterval`, I/O, UI rendering.
- **Rule**: after each synchronous run finishes (Call Stack empty), the Event Loop drains the **entire microtask queue first**, then runs **one** macrotask, repeat.
```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// Output: 1, 4, 3, 2
```
- **Why it matters**: explains why Promises "jump the queue" ahead of `setTimeout(...,0)`, and why long sync code blocks rendering/timers (UI freeze).

### 🔴 Promises
- **What**: object representing a value that will be available later (`pending → fulfilled/rejected`).
- **Why**: fixes "callback hell" (deeply nested callbacks), gives structured error handling.
```js
fetch(url)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
  .finally(() => console.log("done"));

Promise.all([p1, p2]);      // all resolve or fail fast on first rejection
Promise.allSettled([p1, p2]); // waits for all, gives status of each
Promise.race([p1, p2]);     // settles as soon as one settles
Promise.any([p1, p2]);      // settles as soon as one fulfills
```

### 🔴 async / await
- **What**: syntactic sugar over Promises — write async code that *reads* like sync code.
- **How**:
```js
async function getData() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
```
- An `async` function always returns a Promise. `await` pauses execution of that function (not the whole program) until the Promise settles.

---

## 6) Shallow Copy vs Deep Copy  🟡

- **Shallow copy**: top-level properties copied, nested objects still shared by reference. `{...obj}`, `Object.assign({}, obj)`, `Array.slice()`.
- **Deep copy**: nested structures fully cloned, no shared references.
```js
structuredClone(obj);                 // ✅ modern, handles dates/maps/sets/circular refs
JSON.parse(JSON.stringify(obj));      // ⚠️ loses functions, undefined, Symbol, Dates become strings
```

### Object methods
1. `hasOwnProperty()` — checks own (not inherited) property.
2. `Object.hasOwn(obj, key)` — modern, safer replacement (doesn't crash on `Object.create(null)`):
```js
const safeMap = Object.create(null);
safeMap.user = "Rahul";
// safeMap.hasOwnProperty("user") ❌ throws — no prototype
Object.hasOwn(safeMap, "user"); // ✅ true
```
3. `propertyIsEnumerable(prop)` — checks if a property shows up in `for...in`/`Object.keys`.
```js
Object.defineProperty(obj, "secret", { value: 123, enumerable: false });
```
4. `valueOf()` — returns the primitive value of an object.
5. `Object.getPrototypeOf(obj)` / `Object.setPrototypeOf(obj, proto)` — read/write the prototype link.
6. 🔴 `Object.freeze(obj)` — makes object immutable (shallow). `Object.isFrozen(obj)` checks it.
7. 🔴 `Object.entries(obj)` / `Object.values(obj)` / `Object.keys(obj)` — convert object to arrays for iteration.
8. 🔴 `Object.assign(target, ...sources)` — merges objects (shallow).

---

## 7) Object Template

```
           Object (constructor)
                 │
      Static methods
       create(), keys(), hasOwn()...
                 │
                 ▼
           Object.prototype
                 │
   hasOwnProperty(), toString(),
   isPrototypeOf(), valueOf()...
                 ▲
                 │
          [[Prototype]]
                 ▲
                 │
      const obj = { user: "Rahul" }
```

---

## 8) Legacy vs Modern Property Access  🟢

#### Getter
```js
// Legacy (deprecated)
obj.__defineGetter__("name", function () { return "Rahul"; });

// Modern
Object.defineProperty(obj, "name", { get() { return "Rahul"; } });
```

#### Setter
```js
// Legacy (deprecated)
obj.__defineSetter__("name", function (value) { console.log("Setting:", value); });

// Modern
Object.defineProperty(obj, "name", { set(value) { console.log("Setting:", value); } });
```

#### Lookup
```js
// Legacy
obj.__lookupGetter__("name");
obj.__lookupSetter__("name");

// Modern
Object.getOwnPropertyDescriptor(obj, "name");
```
> Why avoid legacy: `__defineGetter__`/`__lookupGetter__` etc. are deprecated (Annex B, kept only for web compatibility). `Object.defineProperty` / `getOwnPropertyDescriptor` are the standard, faster, and support full descriptor config (`enumerable`, `configurable`, `writable`).

---

## 9) Tagged Templates  🟢

- **What**: a function that processes a template literal's strings and interpolated values separately, instead of just concatenating them.
```js
function highlight(strings, ...values) {
  return strings.reduce((acc, str, i) => `${acc}${str}${values[i] ? `**${values[i]}**` : ""}`, "");
}
const name = "Yash";
highlight`Hello ${name}, welcome!`; // "Hello **Yash**, welcome!"
```
- **Why**: used by libraries like `styled-components` (CSS-in-JS) and for safe HTML/SQL escaping.

---

## 10) Enhanced Object Literals (ES6)  🟡

```js
const name = "Rahul", age = 25;
const person = {
  name,              // shorthand property
  age,
  greet() { console.log("hi"); },   // shorthand method
  [`key_${age}`]: "computed key",   // computed property name
};
```

---

## 11) DOM  🔴

- Maintains a **tree** of all tags (Document Object Tree).
- Uses hash-table-like lookups internally for fast `getElementById`, `querySelector`, etc.
- **Event propagation**: capturing (down) → target → bubbling (up).
- **Event delegation**: attach one listener to a parent instead of many on children.

### 🟡 Common DOM methods
| Method | Purpose |
|---|---|
| `querySelector(sel)` / `querySelectorAll(sel)` | select element(s) by CSS selector |
| `getElementById(id)` | fast single lookup by id |
| `createElement(tag)` / `appendChild(node)` | build & insert nodes |
| `addEventListener(evt, fn, opts)` | attach event handler |
| `classList.add/remove/toggle` | manage CSS classes |
| `closest(selector)` | find nearest matching ancestor |

---

## 12) `this` Keyword  🔴

#### Case 1 — losing context
```js
const person = {
  name: "John",
  greet() { console.log(this.name); }
};
const fn = person.greet;
fn(); // undefined — called with no object before the dot
```

#### Case 2 — arrow function as a method (footgun)
```js
const person = {
  name: "John",
  greet: () => { console.log(this.name); } // 'this' = surrounding (module/window) scope, NOT person
};
person.greet(); // undefined
```

#### Case 3 — explicit binding
```js
function greet() { console.log(this.name); }
const person = { name: "John" };
greet.call(person); // "John"
```

#### Case 4 — the mental model
- **Regular function**: *"Who called me?"* → that object is `this`.
- **Arrow function**: *"Where was I created?"* → inherits `this` from that lexical scope.
```js
button.addEventListener("click", function () {
  console.log(this); // button (the caller)
});
button.addEventListener("click", () => {
  console.log(this); // surrounding scope's this, often window
});
```

---

## 13) Prototype Chain  🔴

```
user
   │
   ▼
User.prototype
   │
   ▼
Object.prototype
   │
   ▼
null
```
- **Why**: this is how JS implements inheritance — when you access `user.someMethod`, the engine walks up the chain until it finds it or hits `null`.

---

## 14) call() / apply() / bind()  🔴

### call()
```js
const person = { name: "Yash", greet() { console.log(this.name); } };
const fn = person.greet;
fn.call(person); // "Yash" — invokes immediately, args passed individually
```

### apply()
```js
greet.call(person, 25, "Rajkot");
greet.apply(person, [25, "Rajkot"]); // same, but args as an array
```
- **Why apply is still useful**: spreading an array of args, e.g. `Math.max.apply(null, arr)` (though `Math.max(...arr)` is now preferred).

### bind()
```js
function greet() { console.log(this.name); }
const person = { name: "Yash" };
const sayHello = greet.bind(person); // does NOT call immediately
sayHello(); // "Yash"
```
```
bind() → creates new function → stores this = person → returns new function (called later)
```
- **Why**: useful for event handlers, `setTimeout` callbacks, partial application (pre-filling some args).

---

## 15) Generators & Iterators  🟡

```js
const numbers = [1, 2, 3];
const iterator = numbers[Symbol.iterator]();
iterator.next(); // { value: 1, done: false }
iterator.next(); // { value: 2, done: false }
iterator.next(); // { value: 3, done: false }
iterator.next(); // { value: undefined, done: true }
```
- `for...of` internally uses `Symbol.iterator`.

```js
function* generate() {
  yield 'Hello';
  yield 'World';
  return 'Done';
}
const generator = generate();
generator.next(); // { value: 'Hello', done: false }
generator.next(); // { value: 'World', done: false }
generator.next(); // { value: 'Done', done: true }
generator.next(); // { value: undefined, done: true }
```
- **Why generators matter**: lazy evaluation (compute values on demand), infinite sequences, and they're the foundation `async/await` was originally built on top of.

---

## 16) Regex  🟡

`test()` → returns boolean. `match()` → returns matches (or `null`).

- `/cat/g` → `g` = global search (find all matches, not just first).
- `i` → ignore case.
- `\D` → non-digit. `\d` → digit. `\s` → whitespace. `\w` → word character.

| Symbol | Meaning |
|---|---|
| `.` | Any single character except newline |
| `*` | Zero or more |
| `+` | One or more |
| `?` | Zero or one |
| `^` | Start of string |
| `$` | End of string |
| `[]` | Character set |
| `()` | Group |
| `\|` | OR |
| `\` | Escape special characters |

---

## 17) Event Delegation  🔴

- Attach **one** listener on a parent instead of many on children.
- Child clicked → event bubbles up to parent → `event.target` identifies the actual clicked element.

**Steps**: user clicks `<li>` → event reaches target → bubbles up to `<ul>` → parent's listener fires → `event.target` tells you which `<li>` was clicked.

- **Why**: better performance (1 listener vs N), and works automatically for elements added **later** (dynamic content) since you never had to attach a listener to them individually.

---

## 18) Event Propagation  🔴

1. **Bubbling** (default): innermost → outermost. Used for delegation.
2. **Capturing** (trickle-down): outermost → innermost. Enable via `addEventListener(evt, fn, { capture: true })`. Used to intercept before the target handles it.
3. 🟡 **`stopPropagation()`** — stops the event from continuing to bubble/capture further.
4. 🟡 **`preventDefault()`** — stops the browser's default action (e.g. form submit, link navigation) without stopping propagation.

---

## 19) Currying  🟡

```js
function startsWith(prefix) {
  return function(str) {
    return str.startsWith(prefix);
  };
}
const startsWithMr = startsWith("Mr.");
startsWithMr("Mr. John"); // true
```
- **Why**: turns a multi-arg function into a chain of single-arg functions — enables reuse and composition, pairs well with `map`/`filter`/`reduce`.
```js
const prop = key => obj => obj[key];
const getAge = prop("age");
users.map(getAge); // instead of users.map(user => user.age)
```

---

## 20) 🔴 Array Methods (very high interview + daily-use frequency)

| Method | What it does | Mutates original? |
|---|---|---|
| `map(fn)` | transforms each element → new array | ❌ |
| `filter(fn)` | keeps elements matching condition → new array | ❌ |
| `reduce(fn, init)` | folds array into a single value | ❌ |
| `forEach(fn)` | runs a side-effect for each element, returns `undefined` | ❌ |
| `find(fn)` | first matching element (or `undefined`) | ❌ |
| `findIndex(fn)` | index of first match (or `-1`) | ❌ |
| `some(fn)` | true if ANY element matches | ❌ |
| `every(fn)` | true if ALL elements match | ❌ |
| `includes(val)` | true if value exists | ❌ |
| `sort(fn)` | sorts in place | ✅ |
| `slice(a,b)` | extracts a portion → new array | ❌ |
| `splice(i,n,...items)` | removes/inserts elements | ✅ |
| `flat(depth)` | flattens nested arrays | ❌ |
| `flatMap(fn)` | map + flatten one level | ❌ |
| `Array.from(iterable)` | builds array from iterable/array-like | — |
| `Array.isArray(x)` | type check | — |

```js
[1, 2, 3].reduce((sum, n) => sum + n, 0); // 6
[1, [2, [3, 4]]].flat(2); // [1, 2, 3, 4]
```
- **Why reduce matters most**: `map`, `filter`, and even `forEach` can technically be built using `reduce` — it's the most general-purpose array method.

---

## 21) 🟡 String Methods

`slice()`, `substring()`, `split()`, `trim()`, `padStart()/padEnd()`, `replace()/replaceAll()`, `includes()`, `startsWith()/endsWith()`, `toUpperCase()/toLowerCase()`, template literals (`` `Hello ${name}` ``).

---

## 22) 🔴 Destructuring & Spread/Rest

```js
// Destructuring
const { name, age = 18 } = person;
const [first, , third] = arr;

// Spread — expands an iterable
const merged = { ...obj1, ...obj2 };
const combined = [...arr1, ...arr2];
Math.max(...numbers);

// Rest — collects remaining into one variable
const { name, ...others } = person;
function sum(...nums) { return nums.reduce((a,b) => a+b); }
```
- **Why**: cleaner extraction of values, immutable-style updates (`{...state, key: newVal}` is the backbone of React state updates).

---

## 23) 🔴 Optional Chaining & Nullish Coalescing (ES2020)

```js
user?.address?.city;        // undefined instead of throwing, if address is null/undefined
user?.getName?.();          // safely calls a method only if it exists

const value = input ?? "default"; // only falls back on null/undefined (NOT 0, "", false)
const value2 = input || "default"; // falls back on ANY falsy value — different behavior!
```
- **Why**: avoids verbose `if (user && user.address && user.address.city)` chains, and `??` fixes the classic `||` bug where `0` or `""` incorrectly triggers the fallback.

---

## 24) 🔴 Equality: == vs === and Type Coercion

- `===` (strict): compares value AND type, no conversion.
- `==` (loose): converts types before comparing → causes surprising bugs.
```js
0 == "0"     // true  (string coerced to number)
0 == ""      // true
null == undefined // true
NaN === NaN  // false! use Number.isNaN(x) or Object.is(x, NaN)
```
- **Rule of thumb**: always use `===`/`!==` unless you have a specific reason not to.

---

## 25) 🔴 Classes, Inheritance & OOP

```js
class Animal {
  #privateField = "secret"; // 🟡 private field (ES2022), truly inaccessible outside class
  constructor(name) { this.name = name; }
  speak() { console.log(`${this.name} makes a noise`); }
  static create(name) { return new Animal(name); } // static method — called on class, not instance
}

class Dog extends Animal {
  speak() {
    super.speak();               // calls parent's method
    console.log(`${this.name} barks`);
  }
}
new Dog("Rex").speak();
```
- **Why**: classes are syntactic sugar over prototype-based inheritance — cleaner syntax, but under the hood it's still the prototype chain from section 13.
- `super()` must be called before using `this` in a subclass constructor.

---

## 26) 🟡 Map, Set, WeakMap, WeakSet

```js
const map = new Map();
map.set("a", 1).set("b", 2);
map.get("a");        // 1
map.has("b");         // true
[...map.keys()];      // ["a","b"]

const set = new Set([1, 2, 2, 3]);
[...set];              // [1, 2, 3] — auto-dedupes
```
- **Why Map over plain object**: any type as key (not just strings), preserves insertion order reliably, has `.size`, doesn't inherit prototype pollution risk.
- **WeakMap/WeakSet**: keys must be objects, entries are garbage-collected when the key has no other references → used to avoid memory leaks (e.g. storing metadata tied to a DOM node's lifetime).

---

## 27) 🔴 Error Handling

```js
try {
  JSON.parse("invalid json");
} catch (err) {
  console.error(err.message);
} finally {
  console.log("always runs");
}

// Custom errors
class ValidationError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ValidationError";
  }
}
throw new ValidationError("Invalid input");
```
- **Why**: distinguishing error types lets you handle different failures differently (e.g. network error vs validation error).
- Async errors: wrap `await` in `try/catch`, or use `.catch()` on Promises — an unhandled rejection can crash a Node process.

---

## 28) 🟡 Modules (ESM)

```js
// utils.js
export const add = (a, b) => a + b;
export default function multiply(a, b) { return a * b; }

// main.js
import multiply, { add } from './utils.js';
```
- **Why**: encapsulation, tree-shaking (unused exports removed from bundle), avoids polluting global scope — replaced older patterns like IIFEs and CommonJS `require`/`module.exports` for browser code.

---

## 29) 🟢 IIFE (Immediately Invoked Function Expression)

```js
(function() {
  console.log("runs immediately");
})();
```
- **Why (historically)**: before ES6 modules/`let`/`const`, this was the main way to create a private scope and avoid leaking variables into global scope.

---

## 30) 🟡 Debounce & Throttle

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```
- **Debounce**: waits until the user *stops* triggering an event (e.g. search-as-you-type — wait until they stop typing).
- **Throttle**: limits execution to once per interval, no matter how often triggered (e.g. scroll/resize handlers).
- **Why**: both are closures in action — they rely on the outer variable (`timer`/`inThrottle`) persisting between calls.

---

## 31) 🟢 Memoization

```js
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
```
- **Why**: caches expensive function results by input — another practical closure use case.

---

## 32) JS Environments / Runtime APIs  🟢

1. `setTimeout()` / `setInterval()`
2. `fetch()`
3. `document` / `window`
4. `localStorage` / `sessionStorage`
5. `navigator`
6. `history`
7. `requestAnimationFrame()`
8. 🟡 `structuredClone()`
9. 🟡 `AbortController` — cancel in-flight `fetch` requests

> These are NOT part of the JavaScript language (ECMAScript) itself — they're provided by the **host environment** (browser or Node.js), which is why Node has no `window`/`document` but has `fs`, `process`, etc.

#### Why was ECMAScript created?
- In 1995, Netscape created JavaScript. Microsoft made its own version (JScript) for Internet Explorer, causing compatibility problems.
- Netscape submitted JavaScript to ECMA International, which published the ECMAScript standard in 1997.
- Since then, every JS engine implements JavaScript according to the ECMAScript spec — this is why "ES6/ES2015", "ES2020" etc. are the real version names, and "JavaScript" is really an implementation of ECMAScript.

---

## 33) 🟢 Fetch / Headers methods

```
https://chatgpt.com/s/t_6a5885b81e808191b20ab77d5973a669
```
- `fetch(url, { method, headers, body })`
- `Headers` object methods: `.get()`, `.set()`, `.has()`, `.append()`, `.delete()`

---

## 34) 🟡 Symbol (ES6 primitive)

- **What**: a unique, immutable primitive value, often used as a non-colliding object property key.
- **Why**: prevents property name clashes (e.g. `Symbol.iterator` used internally by `for...of` — see section 15) and can create "hidden" properties not shown in normal enumeration.
```js
const id = Symbol("id");
const user = { [id]: 123, name: "Yash" };
Object.keys(user); // ["name"] — symbol key is skipped
```

---

## 35) 🟢 Functional Programming Concepts

- **Pure function**: same input → same output, no side effects (no mutating outside state, no I/O).
- **Immutability**: never mutate data directly — create new copies (`{...obj}`, `[...arr]`).
- **Higher-order function**: a function that takes and/or returns another function (`map`, `filter`, `debounce`, `curry` are all HOFs).
- **Why it matters**: pure/immutable code is easier to test, debug, and reason about — and is the foundation of how frameworks like React expect state updates to work.


## 36) Object.defineProperty()

- **To avoid a some key for make it unenumerable**

```
const arr = [10, 20, 30];

Object.defineProperty(arr, "1", {
  value: 20,
  enumerable: false
});

for (const key in arr) {
  console.log(key);
}
// Output: 0 2
```

```
const arr = [10, 20, 30];

Object.defineProperty(arr, "secret", {
  value: "hidden",
  enumerable: false
});

console.log(arr.secret); // hidden

for (const key in arr) {
  console.log(key);
}
```