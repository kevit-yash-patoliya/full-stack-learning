# Why Node js ? 

- npm, v8 engine, frontend/backend

# V8 Engine 

**V8 alone only understands basic JS (like arrays, objects, and functions). Node.js wraps V8 and adds C++ bindings and libraries (like libuv) to give JavaScript access to system-level features that browsers block for security:**

1. File System access (fs)

2. Networking capabilities (http, net)

3. Operating system details (os)

# How Node.js Handles Requests

**Non-Blocking I/O (Database, file any async task)**

# Event-Driven Architecture

- when some async task is finished then take respective callback func and then execute

# Single Thread vs. Thread Pool (4 default C++ thread)

# CommonJS v/s ModernJS

- babel/esbuild/swc  
- `require` import sync manner 
- `import/export` import export using async manner
| Feature | **CommonJS (CJS)** | **ES Modules (ESM)** |
| --- | --- | --- |
| **Primary System For** | Node.js (Legacy / Default) | Modern JavaScript Standard (Browsers & Node.js) |
| **Loading Mechanism** | **Synchronous** (blocks execution while loading) | **Asynchronous** (loads & parses ahead of execution) |
| **Extension Rules** | `.cjs` (or `.js` when `"type"` is omitted/`"commonjs"`) | `.mjs` (or `.js` when `"type": "module"` in `package.json`) |
| **Top-Level Await** | ❌ Not supported | ✅ Supported natively |
| **Dynamic Loading** | ✅ Built-in dynamically via standard function calls | ✅ Supported via dynamic `import()` function |
| **Extension Omission** | ✅ Resolves `./file` to `./file.js` or `./file/index.js` | ❌ Requires exact file paths & extensions (e.g., `./file.js`) |
| **File Globals** | Includes `__dirname` and `__filename` | Excludes `__dirname`/`__filename` (recreated via `import.meta.url`) |
| **Module Scope (`this`)** | Points to `module.exports` | `undefined` |
| **Package Entry Point** | Configured via `"main": "./index.js"` | Configured via `"exports": { "import": "...", "require": "..." }` |




# process.env.NODE_ENV == 'developement' / 'testing' / 'staging' / 'production'

# Older Version support Websocket native but after 22 it does because they need scalability and need server

<details>
<summary>
 <strong>Node.js Security Best Practices</strong>
</summary>

Here are four of the most critical vulnerabilities covered in the doc, explained with **real-world code examples**:

---

### 1. Denial of Service (DoS) via Unhandled Socket Errors

**The Threat:** If a client drops their connection abruptly or sends a malformed packet, Node's networking layer fires an error event. If your server doesn't handle this error, the whole Node process crashes, taking down the app for all users.

❌ **Vulnerable Example:**

```javascript
const net = require('node:net');

const server = net.createServer((socket) => {
    socket.write('Hello World\r\n');
  socket.pipe(socket);
  // Missing error handler! If socket errors out, process crashes.
});

server.listen(5000);

```

✅ **Secure Fix:**
Always attach an error listener to prevent unhandled crashes, and set timeouts for slow/idle connections:

```javascript
const net = require('node:net');

const server = net.createServer((socket) => {
    // Gracefully log/catch network errors instead of crashing
  socket.on('error', (err) => {
      console.error('Socket error caught:', err.message);
  });

  socket.write('Hello World\r\n');
  socket.pipe(socket);
});

server.listen(5000);

```

---

### 2. Information Exposure through Timing Attacks

**The Threat:** Standard string comparisons (`===`) stop checking as soon as they find the first mismatching character. An attacker can measure request/response times in milliseconds to guess secrets character-by-character based on how long the server took to respond.

❌ **Vulnerable Example:**

```javascript
// Stops comparing immediately on the first wrong character (variable-time)
function verifyApiKey(userInput, correctKey) {
    return userInput === correctKey; 
}

```

✅ **Secure Fix:**
Use `crypto.timingSafeEqual()` so the operation takes the exact same amount of time regardless of whether characters match or not:

```javascript
const crypto = require('node:crypto');

function verifyApiKey(userInput, correctKey) {
    const bufA = Buffer.from(userInput);
  const bufB = Buffer.from(correctKey);

  // Checks every byte consistently, preventing response-time leakage
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

```

---

### 3. Exposing Secrets during `npm publish`

**The Threat:** When you publish a package to npm, Node uploads **every file in the folder** by default—including local config files containing API keys, `.env` files, or test keys.

❌ **Vulnerable Setup:**
Keeping `.env` or sensitive configs in your root directory without excluding them:

```text
my-library/
├── index.js
├── package.json
└── .env  <-- DANGER: Will be uploaded to public npm registry!

```

✅ **Secure Fix:**
Explicitly list what *is* allowed using the `files` array in `package.json`, or block sensitive files using `.gitignore` and `.npmignore`.

```json
// package.json
{
  "name": "my-safe-library",
  "version": "1.0.0",
  "files": [
      "dist/",
    "index.js"
  ]
}

```

*Tip: Run `npm publish --dry-run` in your terminal to see a list of files that will be published before making them public.*

---

### 4. Malicious Third-Party Modules & Supply Chain Attacks

**The Threat:** Once installed, an npm package runs with the same full privileges as your Node process. It can read your file system, read environment variables, or send requests anywhere.

❌ **Vulnerable Setup:**
Using loose dependency versions in `package.json` with a caret (`^`) allows automatic minor version upgrades:

```json
"dependencies": {
    "some-logger": "^1.2.0" // Auto-updates to 1.2.1, 1.3.0 on install
}

```

If a hacker compromises `some-logger` and publishes `1.2.1` with code that steals `process.env`, your next build will automatically pull the malware.

✅ **Secure Fix:**

* Pin exact versions or rely on `package-lock.json` (`npm ci`).
* Run `npm audit` regularly to check for known vulnerabilities in your dependency tree.
* Avoid running post-install scripts from unknown packages (`npm install --ignore-scripts`).

    </details>

# Process 
```
process.env: Accesses environment variables passed from the OS.

process.argv: Reads command-line arguments.

process.exit(code): Terminates the application (e.g., process.exit(0) for success, process.exit(1) for failure).

process.cwd(): Returns the current working directory where the Node command was executed.

process.nextTick(): Schedules a callback to run right after the current operation finishes.

process.memoryUsage(): Returns memory usage stats (heap used, heap total, etc.).
```

# Streams 

- **pipe only use when left side is readable and right side writable if they not then fails**

1. https://chatgpt.com/s/t_6a672313d22c819196c983b2ddfc6a27

2. https://chatgpt.com/s/t_6a6722f2b4f8819181bdf6a2c34b8209

# Buffers

- **The data from the disk is copied into RAM, and Node.js exposes that memory as a Buffer.**

**https://chatgpt.com/s/t_6a6725712c7881918438d210965ce128**


# Process

**https://chatgpt.com/s/t_6a672f7d5acc8191a8e8117cd0d531df**


# Child Process

**https://chatgpt.com/s/t_6a67346498ac8191b3d04809315f8ab9**

# child process v/s worker

https://chatgpt.com/s/t_6a6736d14c288191aa93689dd4ce1494

# clustering

https://chatgpt.com/s/t_6a673cea8e1481919ff6f4a21e6716a7

# Node js architecture

https://chatgpt.com/s/t_6a673d9a02208191857abee0fd95894f

https://chatgpt.com/s/t_6a67569c8cc081918bd31aaa1b6d7bcb


# Logging

<!-- types -->
```
Application Logs

System Logs

Security Logs

Access Logs

Audit Logs
```

```
console.log()

console.error()

console.warn()

console.info()

console.table()

console.time()
```


we have to two library 

- pino
- winston


```
npm install winston winston-daily-rotate-file
```

```
const winston = require("winston");
require("winston-daily-rotate-file");

const transport = new winston.transports.DailyRotateFile({
    filename: "logs/app-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d"
});

const logger = winston.createLogger({
    transports: [transport]
});

logger.info("Server Started");
```


# Folder Structure 

**/config : for db, jwt files**
**/utils : reuseable functions**
**/services : business logic files**
**/controllers : business logic files**
**/constants : business logic files**
**/helpers : helper small functions**

```
function success(res,data){

    return res.status(200).json({

        success:true,

        data

    });

}

module.exports = success;
```


```
shopping-app/

├── package.json
├── .env
├── src
│
├── config
│   ├── database.js
│   ├── jwt.js
│   └── mail.js
│
├── constants
│   ├── roles.js
│   ├── status.js
│   └── messages.js
│
├── controllers
│   └── userController.js
│
├── services
│   ├── userService.js
│   └── paymentService.js
│
├── helpers
│   ├── responseHelper.js
│   └── authHelper.js
│
├── utils
│   ├── logger.js
│   ├── formatDate.js
│   └── pagination.js
│
├── routes
│   └── userRoutes.js
│
├── models
│   └── User.js
│
├── middleware
│   └── authMiddleware.js
│
└── server.js
```


# Memory Monitoring
```
function logMemoryUsage() {
  const memory = process.memoryUsage();
  
  console.log({
    rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,          // Total memory allocated for process
    heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,// V8 total allocated heap
    heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,  // Actual memory consumed by objects/variables
    external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`,  // C++ bound objects (Buffers)
  });
}

// Log memory every 5 seconds
setInterval(logMemoryUsage, 5000);

```



# setImmediate v/s setTimeout 


```
const fs = require("fs");

fs.readFile("file.txt", () => {
  setTimeout(() => {
    console.log("timeout");
  }, 0);

  setImmediate(() => {
    console.log("immediate");
  });
});

```
- output 
```

```
immediate
timeout
```


# 