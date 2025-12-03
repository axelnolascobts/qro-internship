// Import http and fs
const http = require('http');
const fs = require('fs');

// Set port
const port = 5001;

// Server GET
const server = http.createServer((request, response) => {
    // Make sure only GET method is used
    if (request.method !== 'GET') {
        console.log("Only GET is allowed.");
        return response.end("Only GET is allowed.");
    };

    // Check if db.json exists
    fs.access('./db.json', fs.constants.F_OK, (error) => {
        if (error) {
            return response.end("Error: db.json does not exist.");
        }

        fs.readFile('./db.json', 'utf8', (error, content) => {
            if (error) {
                return response.end("Error reading db.json");
            }
            // Check if the content in db.json is empty
            if (!content.trim()) {
                return response.end("Error: db.json is empty");
            }

            // Otherwise, show content
            response.setHeader('Content-Type', 'application/json');
            response.end(content);
        });
    });
});

// Notify that server is running
server.listen(port, () => {
    console.log(`example1 is running on port http://localhost:${port}`);
})