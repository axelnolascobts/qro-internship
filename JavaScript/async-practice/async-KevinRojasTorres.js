//------------------------------------------------------
// 1. XMLHttpRequest
const xrequest = new XMLHttpRequest();
xrequest.open("GET", "https://jsonplaceholder.typicode.com/users");

xrequest.onload = function () {
    if (xrequest.status >= 200 && xrequest.status < 400) {
        const data = JSON.parse(xrequest.responseText);
        const names = data.map(user => user.name);
        console.log("XHR Names: ", names);
    }
    else {
        console.error("HTTP Error:", xrequest.status, xrequest.statusText);
    }
};

xrequest.onerror = function () {
    console.error("Network Error: Could not reach the server.")
}

xrequest.send();

//------------------------------------------------------
// 2. Fetch API
fetch("https://jsonplaceholder.typicode.com/users")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
        };
        return response.json();
    })
    .then(data => {
        const names = data.map(user => user.name);
        console.log("Fetch Names:", names);
    })
    .catch(error => console.error("Fetch Error:", error.message));

//------------------------------------------------------
// 3. Promise-based Function
function getUserNames() {
    return new Promise((resolve, reject) => {
        fetch("https://jsonplaceholder.typicode.com/users")
            .then(response => {
                if (!response.ok) {
                    reject(`HTTP Error: ${response.status}`)
                };
                return response.json();
            })
            .then(data => resolve(data.map(user => user.name)))
            .catch(error => reject(`Network Error: ${error}`));
    });
}

getUserNames()
    .then(names => console.log("Promise Function Names:", names))
    .catch(error => console.error(error));

//------------------------------------------------------
// 4. Async/Await
async function getUserNamesAsync() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        return data.map(user => user.name);

    }
    catch (error) {
        console.error("Async Error:", error.message);
        throw error; // Re-throw for caller (good practice)
    }
}

getUserNamesAsync()
    .then(names => console.log("Async/Await Names:", names))
    .catch(error => console.error(error));

//------------------------------------------------------
// Part 2.
//------------------------------------------------------
/* Q1
    1. The Promise object is being displayed instead of the data.
    That's because console.log(response.json()) logs the Promise 
    returned by response.json() before it resolves, giving undefined.

    2. That's because console.log executes before the Promise from
    from response.json() resolves. The console.log does not wait long
    enough.

    3. The response.json() takes the data and turns it into a 
    JSON format. However, since it takes longer to complete than
    console.log allows it, it returns a Promise isntead.
*/

// Q2 - Solution 1
fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => {
        return response.json();
    })
    .then(posts => console.log("Posts Sol1:", posts))
    .catch(error => console.error("Error:", error));

// Q2 - Solution 2
fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => {
        // parse JSON here, then log inside the same callback
        response.json().then(posts => console.log("Posts Sol2", posts));
    })

    .catch(error => console.log("Error:", error));

// Q3 - Async of Solution 1
async function getPosts() {
    try {
        // Make the request
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");

        // Check if the response was successful
        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
        }

        // Convert the response to JSON
        const posts = await response.json();

        // Show the posts in the console
        console.log("Async of Sol1:", posts);

    } catch (error) {
        // This will catch network errors OR the HTTP error above
        console.log("Error:", error.message);
    }
}

getPosts();