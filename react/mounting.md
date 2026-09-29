What Happens During Mounting?
When React mounts a component, it goes through a specific sequence of steps:

Initialization: React reads the component function (or class constructor) and evaluates its initial state and props.

Rendering: React calls the component function to get its JSX and creates the virtual DOM representation.

DOM Insertion: React takes that virtual DOM and inserts real HTML nodes into the browser's DOM.

Side Effects Execution: Once the component is in the real DOM, React runs any post-render side effects (like fetching data or setting up event listeners).