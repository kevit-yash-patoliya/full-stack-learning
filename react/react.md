
# Why doesn't Root create twice ?  

```jsx
import { createRoot } from "react-dom/client";

// 1. Find the DOM element
const root = createRoot(document.getElementById("app"));

// 2. JSX → React element
const hello = <h1>Hello World</h1>;

// 3. Tell React what UI should exist inside #app
root.render(hello);
```

HTML:

```html
<div id="app"></div>
```

### Remember the flow

```text
HTML
  ↓
<div id="app">
  ↓
createRoot()
  ↓
React Root
  ↓
root.render(hello)
  ↓
<h1>Hello World</h1>
```

And this:

```jsx
root.render(hello);
root.render(hello);
```

**does not append two `<h1>` elements.** React makes the root match `hello`; since the second render is the same UI, there is no visible DOM change.

**One-line revision:**

> `createRoot()` → tells React **where** to render.
> `root.render()` → tells React **what UI** to render.


# we can create element using `React.createElement()` 
```
React.createElement(
  'div',
  { className: 'container' },
  'i am div'
);
```

# React hooks

- https://react.dev/reference/react/hooks


# react redux v/s use context

Here is a clear code comparison demonstrating how `useContext` triggers extra re-renders across consumers versus how Redux Toolkit's `useSelector` prevents unnecessary renders.

---

### 1. `useContext` Scenario

When using `useContext`, updating **any single value** in the context forces **all components subscribing to that context** to re-render—even if they don't use the changed property.

```jsx
// UserContext.js
import { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({ name: 'Alex', score: 100 });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Component A: Cares ONLY about user.name
function UserName() {
  const { user } = useContext(UserContext);
  console.log('UserName rendered!'); // ⚠️ Re-renders when score changes!
  return <h1>{user.name}</h1>;
}

// Component B: Updates user.score
function ScoreButton() {
  const { setUser } = useContext(UserContext);
  return (
    <button onClick={() => setUser(u => ({ ...u, score: u.score + 1 }))}>
      Increase Score
    </button>
  );
}

```

> **The Problem:** Clicking `<ScoreButton>` updates `score`. Even though `UserName` only cares about `user.name`, **`UserName` is forced to re-render** because the context object reference changed.

---

### 2. Redux Toolkit Scenario

Redux selectors perform **strict reference equality checks** on the specific return value of your selector function. If the selected value hasn't changed, the component completely skips re-rendering.

```jsx
// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { name: 'Alex', score: 100 },
  reducers: {
    incrementScore: (state) => {
      state.score += 1;
    },
  },
});

export const { incrementScore } = userSlice.actions;
export default userSlice.reducer;

```

```jsx
// Component A: Cares ONLY about user.name
import { useSelector } from 'react';

function UserName() {
  // Redux checks: Has state.user.name changed? No -> Skip render!
  const name = useSelector((state) => state.user.name);
  console.log('UserName rendered!'); // ✅ Only logs on initial render!
  return <h1>{name}</h1>;
}

// Component B: Updates user.score
import { useDispatch } from 'react';

function ScoreButton() {
  const dispatch = useDispatch();
  return (
    <button onClick={() => dispatch(incrementScore())}>
      Increase Score
    </button>
  );
}

```

> **The Solution:** Clicking `<ScoreButton>` updates `score` in the Redux store. `useSelector` checks if `state.user.name` changed. Since `"Alex" === "Alex"`, **`UserName` does NOT re-render at all**.

---

### Performance Summary

* **`useContext`:** Best for low-frequency changes (Themes, Auth user info, UI Language).
* **`Redux Selector`:** Essential for high-frequency or multi-property state (Forms, Carts, Real-time feeds) to maintain 60 FPS performance.



## Comparison

While React's `useContext` works well for simple global data (like themes or user auth), **Redux (via Redux Toolkit)** is designed for **complex state management, frequent updates, and large-scale applications**.

Here is a direct comparison of why you would choose Redux over `useContext`:

---

### Core Differences & Performance Features

#### 1. Performance & Rerender Optimization

* **`useContext`:** Every component consuming a context re-renders whenever **any** value inside that context object changes. If you store 10 properties in one context, updating 1 property forces every subscriber to re-render.
* **Redux:** Uses precise **selectors** (`useSelector`). Components re-render **only** when the specific piece of state they subscribe to actually changes.

#### 2. Middleware & Side Effects

* **`useContext`:** Has no built-in middleware system. Async logic (API calls, side effects) must be written inside `useEffect` or scattered across components.
* **Redux:** Has built-in support for middleware (`createAsyncThunk`, **RTK Query**). This gives you automated API data fetching, response caching, request deduplication, and easy side-effect handling outside your UI components.

#### 3. Debugging & Developer Tools

* **`useContext`:** Offers limited debugging via React DevTools. Tracking when, where, and why state changed across multiple components can be difficult.
* **Redux:** Features the **Redux DevTools Extension**, providing:
* **Time-travel debugging:** Step forward and backward through state changes.
* **Action logging:** View exact actions fired with payloads.
* **State snapshots:** Export and import exact application states to reproduce bugs easily.



#### 4. Architecture & Code Scalability

* **`useContext`:** Scaling often leads to "Context Hell"—wrapping your application in 10+ nested `<Context.Provider>` wrappers.
* **Redux:** Centralizes your entire global state in a single, organized store split into modular "slices" (`createSlice`).

---

### Summary: When to Use Which

| Feature / Goal | Use `useContext` | Use Redux (Redux Toolkit) |
| --- | --- | --- |
| **Primary Use Case** | Static or low-frequency global values (theme, language, current user session) | Dynamic, complex global data (shopping carts, feeds, multi-step forms, cached API data) |
| **Data Update Frequency** | Infrequent updates | Frequent, high-performance updates |
| **App Complexity** | Small to medium apps | Large, enterprise-level apps with multiple developers |
| **Setup Cost** | Zero setup (built into React) | Minimal setup with Redux Toolkit (`@reduxjs/toolkit`) |




# zustend v/s react redux