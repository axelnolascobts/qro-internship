async function getUserNames() {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
        }
        const users = await res.json();
        const names = users.map(user => user.name);
        return names;
    } catch (err) {
        console.error("Error:", err.message);
        throw err;
    }
}

getUserNames()
    .then(names => {
        console.log('User Names:', names);
    })
    .catch(err => {
        console.error('Failed to get user names', err);
    });
