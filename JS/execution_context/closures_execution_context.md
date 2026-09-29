# Execution Context 

**Every execution context has two phases:** 

### 1. Creation Phase

- JavaScript scans the code before executing it.

- During this phase it:

- **Creates variable bindings** 
- **Creates function declarations**
- **Sets up the scope chain**
- **Determines this**

No code actually runs yet.

### 2. Execution Phase

Now JavaScript executes the code line by line.

Assignments happen.

Functions are called.

Expressions are evaluated.


### why let and var introduce because make a block scope: 
```
https://chatgpt.com/s/t_6a59b4fed9ac819185f6ca8b378a23b7
```


### why prototype ?

```
https://chatgpt.com/s/t_6a59b8131a0481918384c9c8d76634b5
```


### what functional scope contains?

1. Parameters
2. Local Variables
3. Function Declaration
4. this
5. Outer Lexical Environment Reference

```
let x = 10;

function outer() {

    let y = 20;

    function inner() {
        console.log(x);
        console.log(y);
    }

    inner();
}
```
```
Global Scope
    ↑
Outer Scope
    ↑
Inner Scope
```





# Async Await return type:

**it always return promise with resolve**


# Closures

**Data Privacy**

```
https://chatgpt.com/s/t_6a59c1b5b2c4819194ede96b34829d1d
```


