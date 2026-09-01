onmessage = async (event) => {
    if (event.data === "getLargeList") {
        const response = await fetch("https://dummyjson.com/users?limit=100");
        const { users } = await response.json();

        // 100,000 items
        const users10k = Array.from({ length: 1000000 }, (_, index) => ({
            ...users[index % users.length],
            id: index + 1,
        }));

        postMessage(users10k);
    }
}
