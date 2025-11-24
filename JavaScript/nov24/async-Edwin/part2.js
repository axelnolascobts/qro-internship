// 1. Why doesn't it work as expected?
// Explain:
// What is currently displayed in the console? The promise
// Why can't you see the posts? Because it is waiting for the response to propagate with data
// What does response.json() return? It returns the Promise()
// 2. How would you fix it? 
// Provide two different solutions using .then()
// fetch("https://jsonplaceholder.typicode.com/posts")
//   .then(response => response.json())  // Return the promise
//   .then(posts => console.log(posts))   // Handle the resolved data
//   .catch(error => console.log("Error:", error));

// fetch("https://jsonplaceholder.typicode.com/posts")
//   .then(response => {
//     return response.json().then(posts => {
//       console.log(posts);
//       return posts;
//     });
//   })
//   .catch(error => console.log("Error:", error));


async function fetchPosts() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const posts = await response.json();

        console.log("Posts:", posts);
        return posts;

    } catch (error) {
        console.error("Error fetching posts:", error.message);
    }
    return null;
}
fetchPosts();