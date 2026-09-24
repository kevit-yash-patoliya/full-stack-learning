console.log("1");

setTimeout(() => {
  console.log("2 - macro task");

  Promise.resolve().then(() => {
    console.log("3 - microtask");
  });

  Promise.resolve().then(() => {
    console.log("4 - microtask");
  });
}, 0);

setTimeout(() => {
  console.log("5 - macro task");
}, 0);

Promise.resolve().then(() => {
  console.log("6 - microtask");
});

console.log("7");