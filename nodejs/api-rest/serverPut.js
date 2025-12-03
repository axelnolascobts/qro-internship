// Import http and fs
const http = require('http');
const fs = require('fs');

// Set port
const port = 5003;

// Server PUT
const server = http.createServer((request, response) => {
    // Make sure only PUT method is used
    if (request.method !== 'PUT') {
        console.log("Only PUT is allowed.");
        return response.end("Only PUT is allowed.");
    };

    let body = "";

    request.on("data", part => {
        body += part;
    });

    request.on("end", () => {
        let updates = null;
        try {
            updates = JSON.parse(body);
        }
        catch {
            return response.end("Error: body is not proper JSON format.");
        };

        fs.access('./db.json', fs.constants.F_OK, (error) => {
            if (error) {
                return response.end("Error: db.json not found.");
            }

            fs.readFile('./db.json', 'utf8', (error, data) => {
                if (error) {
                    return response.end("Error reading db.json");
                }

                let db = JSON.parse(data);

                // Check if all properties exist
                for (let key in updates) {
                    if (!db.hasOwnProperty(key)) {
                        return response.end(`Error: property ${key} doesn't exist.`)
                    }
                };

                // Apply the updates
                for (let key in updates) {
                    db[key] = updates[key];
                };

                fs.writeFile('./db.json', JSON.stringify(db, null, 2), (error) => {
                    if (error) {
                        return response.end("Error writing to db.json");
                    }

                    response.setHeader("Content-Type", "application/json");
                    response.end(JSON.stringify(db));
                });
            });
        });
    });
});

// Notify that server is running
server.listen(port, () => {
    console.log(`example1 is running on port http://localhost:${port}`);
});