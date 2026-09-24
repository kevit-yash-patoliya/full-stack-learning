Nothing in React helps the server receive `/about`.

It's simply how **HTTP URLs and the browser work**.

Suppose you type this directly into the browser:

```text
http://localhost:3000/about
```

Before React has loaded, the **browser itself** takes the URL and creates an HTTP request:

```http
GET /about
Host: localhost:3000
```

So the sequence is:

```text
You type URL
     ↓
Browser parses URL
     ↓
Browser sees path = /about
     ↓
Browser sends HTTP request
     ↓
Server receives /about
     ↓
Server sends index.html
     ↓
React JavaScript loads
     ↓
BrowserRouter starts
```

React isn't involved in the first part.

---

### Compare HashRouter

You type:

```text
http://localhost:3000/#/about
```

The browser parses:

```text
origin = http://localhost:3000
path   = /
hash   = /about
```

The browser **does not send the hash in the HTTP request**:

```http
GET /
Host: localhost:3000
```

Then:

```text
Server → index.html
              ↓
         React starts
              ↓
       HashRouter reads #/about
              ↓
          <About />
```

### So the crucial rule is:

```text
BrowserRouter:
URL path → HTTP request → server sees it

HashRouter:
URL hash → NOT HTTP request → browser/React sees it
```

That's why **BrowserRouter needs server-side SPA fallback**, while HashRouter can avoid that requirement.
