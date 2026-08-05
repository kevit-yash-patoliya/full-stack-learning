# Javascript Notes

# 1) ( For in ) vs ( For of ) :

1. mainly for in.  is used for objects
2. mainly for of. is used for array traverse and index

# 2) Arrow Functions :

#### why ? (2 main reason )

1.
```

class Timer {
  constructor() {
    this.seconds = 0;
  }
  
  start() {
    setInterval(function() {
      // ❌ ERROR: 'this' here refers to the global window/timer context, not our object!
      this.seconds++; 
      console.log(this.seconds); // Logs: NaN
    }, 1000);
  }
}

```

When you pass a traditional function() { ... } into setInterval, you  are handing that function over to the browser's execution engine.

1. The timer fires after 1 second and executes the inner function.Inside the function, JavaScript evaluates this.seconds++.

2. Because this points to the global window object, it looks for window.seconds.window.seconds does not exist, so it evaluates to undefined.

3. The code attempts to perform math on it: undefined + 1.

4. In JavaScript, adding a number to undefined results mathematically in NaN (Not a Number).

```
class Timer {
  constructor() {
    this.seconds = 0;
  }
  
  start() {
    setInterval(() => {
      //  WORKS: 'this' correctly refers to the Timer object instance
      this.seconds++; 
      console.log(this.seconds); // Logs: 1, 2, 3...
    }, 1000);
  }
}
```

> ```const double = x => x * 2;```  make it cleaner and clearer



# 3) Parameters types
***
##### 1. standard
##### 2. default
##### 3. rest parameters
##### 4. destructured 
##### 5. callback func.




# 4) Scopes

***

- #### functional,block,lexical(whenever someone is accessed like inner function)

### Execution Context

#### An abstract environment created by the JavaScript engine to evaluate and execute code. Every time code runs, it runs inside an Execution Context. It has two phases: Memory Creation (where Hoisting happens) and Code Execution.

##### 1. Global Execution Context (GEC): Created by default when your script starts. There is only ever one.
##### 2. Function Execution Context (FEC): A brand new context created automatically every single time a function is called/invoked.


Imagine you run a file with a nested function call. Here is the lifecycle:The script loads. 

> 1. The engine creates the Global Execution Context.
> 2. The engine scans the file for Hoisting to register Global Scoped items, then pushes the global context onto the Call Stack.
> 3. Your code reaches a function invocation. The engine creates a Function Execution Context.This new context is pushed to the top of the Call Stack, becoming the active layer.
> 4. If that function looks for a variable, it uses Lexical Scope to check its local Block/Function scope first. 
> 5. If it cannot find it, it moves outward to the Global Scope.
> 6. Once the function finishes, its context pops off the Call Stack.


# 5) shallow copy v/s deep copy

- two way to create deep copy
1. ``` structuredClone()```
2. ```json.parse(json.stringify())```

### Object methods

1. ```  hasOwnProperty() ```  


2. ``` Object.hasOwn() ```
```
// ❌ The Legacy Problem:
const safeMap = Object.create(null);
safeMap.user = "Rahul";

// Throws Error: safeMap.hasOwnProperty is not a function
console.log(safeMap.hasOwnProperty("user")); 

//  The Modern Solution:
console.log(Object.hasOwn(safeMap, "user")); // Outputs: true (Never crashes!)
```

- visualize : https://chatgpt.com/s/t_6a5484cf688c8191b3de334bb2d60520


3. ```objName.propertyIsEnumerable(propertyName)``` 
``` 
// we can give a explicit "false" as well
Object.defineProperty(obj, "secret", {
  value: 123,
  enumerable: false
}); 
```

4. ``` valueOf()``` - return its value

5. ``` Object.getPrototypeOf()``` - get protoype of object
6. ``` Object.setPrototypeOf(obj,prototype)```

# 6) Object Templete 

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

# 7) <span style="color:red">Modern Alternates</span>


#### object define getter

```
const obj = {};

obj.__defineGetter__("name", function () {
  return "Rahul";
});

console.log(obj.name); 
```
v/s
```
Object.defineProperty(obj, "name", {
  get() {
    return "Rahul";
  }
});

```



#### object define setter

```
const obj = {};

obj.__defineSetter__("name", function (value) {
  console.log("Setting:", value);
});

obj.name = "Rahul";
```
v/s
```
Object.defineProperty(obj, "name", {
  set(value) {
    console.log("Setting:", value);
  }
});

```

#### __lookupGetter__() and __lookupSetter__()

```
const obj = {
  get name() {
    return "Rahul";
  }
};

console.log(obj.__lookupGetter__("name"));


const obj = {
  set name(value) {
    console.log(value);
  }
};

console.log(obj.__lookupSetter__("name"));
```
vs 

```
const obj = {
  name: "Rahul"
};

console.log(Object.getOwnPropertyDescriptor(obj, "name"));
```


# 8) Tagged Templete

# 9) modern way (Enhanced Object Literals)

```
https://share.google/aimode/jauxZk8bo9f1siITo
```




# 10) DOM 

maintain a tree of all tags

- It uses lookup table to find any element inside a dom tree 

- https://chatgpt.com/s/t_6a54afa335808191b40728554d4546bb

- event propogation bubbling 

- event delgations

- 


# 11) This keyword
***

#### case 1 

```
const person = {
    name: "John",

    greet() {
        console.log(this.name);
    }
};

const fn = person.greet;

fn(); // undefined

```


#### case 2

```
const person = {
    name: "John",

    greet: () => {
        console.log(this.name);
    }
};

person.greet();
```

#### case 3

```
function greet() {
    console.log(this.name);
}

const person = {
    name: "John"
};

greet.call(person);
```

#### case 4

- Easy way to remember

- Regular function:

- "Who called me?" → That's my this.

- Arrow function:

- "Where was I created?" → I use that this.

- So:

```
button.addEventListener("click", function () {
    console.log(this); // button
});

button.addEventListener("click", () => {
    console.log(this); // surrounding scope's this (often window in browser scripts)
});
```

# 12) Execution 

```
https://chatgpt.com/s/t_6a55e0d25e288191b3e12d586e8a2042
```



# 13) Prototype chain


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


# 14) call()

```
const person = {
  name: "Yash",

  greet() {
    console.log(this.name);
  }
};

const fn = person.greet;

// fn() // undefined
// fn.call(person) // Yash
fn.call(person)
```


# 15) apply()


#### Comparison:
```
greet.call(person, 25, "Rajkot");

vs

greet.apply(person, [25, "Rajkot"]);
```


# 16) bind()

```
function greet() {
  console.log(this.name);
}

const person = {
  name: "Yash"
};

const sayHello = greet.bind(person);

sayHello(); // Yash
```


```
bind()
     │
     ▼
Creates new function
     │
     ▼
Stores this = person
     │
     ▼
Returns new function
```


# 17) Generators & Iterators 

```
const numbers = [1, 2, 3];

const iterator = numbers[Symbol.iterator]();

console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

- ```for of``` is used a Symbol.iterator


```
function* generate() {
    yield 'Hello';
    yield 'World';
    return 'Done';
}

const generator = generate();

console.log(generator.next());
console.log(generator.next()); 
console.log(generator.next());
console.log(generator.next()); 
```


# 18) Regex

``` test() ``` 
``` match() ```

- `/cat/g` - g is used for a search globally in string

- `i` - ignores

- `/\D/` - non-digit

- `/\d/` - digit

- `/\s/` - whitespace



| Symbol | Meaning                             |
| ------ | ----------------------------------- |
| `.`    | Any single character except newline |
| `*`    | Zero or more                        |
| `+`    | One or more                         |
| `?`    | Zero or one                         |
| `^`    | Start of string                     |
| `$`    | End of string                       |
| `[]`   | Character set                       |
| `()`   | Group                               |
| `\|`   | OR                                  |
| `\`    | Escape special characters           |



# 19) Event Delegation

```
- Steps of Event Delegation Event Delegation uses a single event listener on a parent element.
 
- When a child element is clicked, the event bubbles up to the parent, and event.target identifies the clicked element.
```


User clicks a child element (`<li>`).
The event reaches the target element.
The event bubbles up to the parent (`<ul>`).
The parent's event listener is triggered.
event.target identifies the clicked child element.


# 20) Event Propagation

#### 1. ``Bubbling``
- Default event propagation behavior in the DOM and React.
- Event flows from the innermost element to the outermost element.
- Commonly used for handling events efficiently with parent components.

#### 2. ``Capturing``

- Event flows from parent to child (outermost to innermost).
- Also referred to as trickle-down event propagation.
- Used when you need to intercept events before they reach the target element.



# 21) Curring

```
function startsWith(prefix) {
    return function(str) {
        return str.startsWith(prefix);
    }
}

const startsWithMr = startsWith("Mr.");

startsWithMr("Mr. John");
startsWithMr("Mr. David");
startsWithMr("Mr. Alex");
```



- Currying works well with functions like map, filter, and reduce.

 - Suppose:
```
const users = [
  { age: 20 },
  { age: 30 },
  { age: 40 }
];
```

- Normal:

```
const ages = users.map(user => user.age);
```
- Suppose you have:

`const prop = key => obj => obj[key];`

- Then:

` const getAge = prop("age"); `

`users.map(getAge);`

`prop("age")` 
- returns a new function that extracts the "age" property.
#### more about curring                                                 

```
https://chatgpt.com/s/t_6a563011405c81919eec461922f3b1fc
```



# 22) Patterns For Codebase

```
https://chatgpt.com/s/t_6a570b36206081918c87a1dd47a9e85e
```


# 23) Js environments :

1. setTimeout()
2. setInterval()
3. fetch()
4. document
5. window
6. localStorage
7. navigator
8. history
9. requestAnimationFrame()


#### Why was ECMAScript created?

- In the early days (1995), Netscape created JavaScript.

- Soon Microsoft created its own version called JScript for Internet Explorer.

- Now there were multiple versions of JavaScript, which caused compatibility problems.

- To solve this, Netscape submitted JavaScript to ECMA International, which created a standard called ECMAScript in 1997.

- From then on:

- Everyone should implement JavaScript according to the ECMAScript specification.




# 24) methods of headers type

```
https://chatgpt.com/s/t_6a5885b81e808191b20ab77d5973a669
```