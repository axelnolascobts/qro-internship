// Import http and fs
const http = require('http');
const fs = require('fs');

// Set port
const port = 5002;

// Server POST
const server = http.createServer((request, response) => {
    // Make sure only POST method is used
    if (request.method !== 'POST') {
        console.log("Only POST is allowed.");
        return response.end("Only POST is allowed.");
    };

    let body = "";

    request.on("data", part => {
        body += part;
    });

    request.on("end", () => {
        let json;
        try {
            json = JSON.parse(body);
            fs.writeFile('./db.json', JSON.stringify(json, null, 2), (error) => {
                if (error) {
                    return response.end("Error writing to db.json");
                }
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify(json));
            });
        }
        catch (error) {
            response.end("Error: body is not valid in JSON");
        };
    });
});

// Notify that server is running
server.listen(port, () => {
    console.log(`example1 is running on port http://localhost:${port}`);
});