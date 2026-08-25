# Advanced React & Browser Engineering Guide

This guide covers advanced React engine behaviors (rendering, reconciliation, hooks, performance) and fundamental browser internals (DOM, rendering pipeline, storage, workers).

---

## Part 1: React Under the Hood

### 1. Rendering vs. Reconciliation

```
  [ Trigger Render ] ──► [ Render Phase (V-DOM Diffing) ] ──► [ Commit Phase (Paint DOM) ]
```

* **Rendering Phase (Pure & Side-Effect Free):** React calls your component functions from the top down to compute the new JSX elements (Virtual DOM).
* **Reconciliation (Diffing Algorithm):** React compares the newly returned Virtual DOM tree with the previous one to identify changes.
  * *Rules of Diffing:*
    1. **Different element types:** React destroys the old tree and builds a new one from scratch (e.g., replacing `<div>` with `<span>`).
    2. **Same element types:** React keeps the DOM node and only updates the modified attributes (e.g., class, style).
    3. **Keys:** React uses the `key` prop to match children in the original tree with children in the subsequent tree. Keys should be **stable, unique, and predictable** (never use random numbers or array indices if the list can be reordered).
* **Commit Phase:** React applies the calculated minimal diff changes to the actual browser DOM (using methods like `appendChild` or `setAttribute`).

---

### 2. Deep Dive on React Hooks

Hooks allow functional components to manage state and lifecycle features.

* **useState:** Preserves state values across renders. 
* **useEffect:** Executes side-effects (data fetching, subscriptions). Runs *after* the render is committed to the screen.
* **useContext:** Reads and subscribes to a React Context.
* **useRef:** Returns a mutable object whose `.current` property persists across renders. **Crucially, updating a ref does NOT trigger a re-render**. Best for storing DOM elements or mutable timers.
* **useMemo:** Caches the result of an expensive calculation between renders:
  ```javascript
  const computedValue = useMemo(() => expensiveFunction(a, b), [a, b]);
  ```
* **useCallback:** Caches the function instance itself to maintain reference stability (preventing child components from re-rendering due to changing function references).

> [!IMPORTANT]
> **Rules of Hooks:**
> 1. Call hooks **only at the top level** of your functional components (never inside loops, conditions, or nested functions). This ensures React maps Hook states correctly based on their execution order.
> 2. Call hooks **only from React Function Components** or Custom Hooks.

---

### 3. Context vs. Redux (Global State)

| Feature | `useContext` | Redux (Redux Toolkit) |
| :--- | :--- | :--- |
| **Mechanic** | React built-in provider pattern. | Centralized external store with selectors. |
| **Performance** | Triggers re-renders on **all** subscribers whenever any property in the context changes. | Subscribers re-render **only** when their selected slice of state changes. |
| **Async Logic** | Requires custom wrappers or inline `useEffect` calls. | Built-in middleware support (Thunks, RTK Query). |
| **Best For** | Low-frequency updates (Theme, Language, Auth). | High-frequency updates (Carts, Feeds, Dashboards). |

---

### 4. Code Splitting, Lazy Loading & Suspense

By default, bundlers compile all code into a single large JavaScript bundle. Code splitting breaks this bundle into smaller chunks loaded on demand.

* **React.lazy:** Dynamically imports components.
* **Suspense:** Wraps lazy components to show a fallback UI (loading spinner) while the bundle is downloading.

```jsx
import { lazy, Suspense } from 'react';

// Dynamic import
const HeavyDashboard = lazy(() => import('./components/HeavyDashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <HeavyDashboard />
    </Suspense>
  );
}
```

---

### 5. Error Boundaries
Class components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the whole app.
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true }; // Update state to display fallback UI
  }

  componentDidCatch(error, errorInfo) {
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh.</h1>;
    }
    return this.props.children;
  }
}
```

---

## Part 2: Browser Internals & Fundamentals

### 1. The Rendering Pipeline

The browser goes through a series of steps to turn HTML/CSS/JS into pixels on the screen:

```
  HTML  ──► DOM Tree ──┐
                       ├─► Render Tree ──► Layout (Reflow) ──► Paint ──► Composite
  CSS   ──► CSSOM ─────┘
```

1. **DOM Tree:** Parsing HTML bytes into a tree structure of nodes.
2. **CSSOM Tree:** Parsing CSS styles into a tree map of style rules.
3. **Render Tree:** Combining DOM and CSSOM to include only visible elements.
4. **Layout (Reflow):** Calculating the exact geometry (size and coordinates) of each visible element on the page.
5. **Paint:** Drawing the colors, borders, shadows, and images of the nodes onto pixels.
6. **Compositing:** Layering the painted elements (e.g., using GPU for transitions, transforms) and sending them to the screen.

---

### 2. Critical Rendering Path (CRP) Optimization
The steps the browser takes to start showing pixels. Reducing CRP times improves Core Web Vitals (LCP, FCP).
* **Optimization Strategies:**
  * **Defer non-critical resources:** Mark scripts with `defer` or `async` to prevent blocking HTML parsing.
  * **Minify & Compress:** Minimize CSS, JS, and HTML file sizes.
  * **Inline Critical CSS:** Embed core styles needed for above-the-fold content directly in the `<head>`.

---

### 3. HTTP Caching Headers

* **Cache-Control:**
  * `no-store`: Do not cache anything.
  * `no-cache`: Cache resources, but force validation with the server before use.
  * `max-age=3600`: Cache the resource locally for 3600 seconds.
* **ETag:** A unique token generated by the server for a file version. When the browser requests it again, it sends `If-None-Match: <ETag>`. If unchanged, the server returns a `304 Not Modified` response (saving bandwidth).

---

### 4. Client-Side Storage Options

| Storage Type | Capacity | Speed/Sync | Use Case |
| :--- | :--- | :--- | :--- |
| **LocalStorage** | ~5MB | Synchronous (Blocks Main Thread) | User preferences, theme settings. |
| **SessionStorage**| ~5MB | Synchronous (Blocks Main Thread) | Single-tab session state. |
| **Cookies** | ~4KB | Synchronous (Sent with HTTP requests) | Authentication tokens, session IDs. |
| **IndexedDB** | Up to 80% disk | Asynchronous (Non-blocking) | Structured offline data, large assets. |

---

### 5. Multi-Threading & Offline: Workers

* **Web Workers:** Run heavy computations (like sorting 10M records) in a separate thread. This keeps the browser's main thread (UI thread) running at 60 FPS without freezing the screen.
* **Service Workers:** Act as a network proxy. They intercept network requests, enabling rich offline caching, pre-fetching, and push notifications for Progressive Web Apps (PWAs).

---

### 6. WebSockets
A communications protocol providing full-duplex, persistent, real-time communication channels over a single TCP connection.
* **WebSocket Flow:**
  1. Browser initiates a standard HTTP request with an `Upgrade: websocket` header.
  2. Connection upgrades, leaving a persistent connection open.
  3. Client and server can push messages instantly to one another without polling overhead.
