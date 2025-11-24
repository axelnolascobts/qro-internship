fetch("https://jsonplaceholder.typicode.com/users")
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
        }
        return res.json();
    })
    .then(users => {
        const names = users.map(user => user.name);
        console.log("User Names:", names);
    })
    .catch(err => {
        console.error("Error:", err.message);
    });