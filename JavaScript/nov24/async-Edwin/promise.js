function getUserNames() {
    return new Promise((resolve, reject) => {
        fetch("https://jsonplaceholder.typicode.com/users")
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
                }
                return res.json();
            })
            .then(users => {
                const names = users.map(user => user.name);
                resolve(names);
            })
            .catch(err => {
                reject(err);
            });
    });
}

getUserNames()
    .then(names => {
        console.log("User Names:", names);
    }).catch(err => {
        console.log("Error:", err.message);
    });