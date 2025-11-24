(function () {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", "https://jsonplaceholder.typicode.com/users", true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const users = JSON.parse(xhr.responseText);
            const names = users.map(user => user.name);
            console.log("User Names:", names);
        } else {
            console.error(`HTTP Error: ${xhr.status} - ${xhr.statusText}`);
        }
    };

    xhr.onerror = function () {
        console.error("Network Error");
    }

    xhr.send();
})();