// Import http and fs
const http = require('http');
const fs = require('fs');

// Set port
const port = 5004;

// Server DELETE
const server = http.createServer((request, response) => {
    // Make sure only DELETE method is used
    if (request.method !== 'DELETE') {
        console.log("Only DELETE is allowed.");
        return response.end("Only DELETE is allowed.");
    };

    let body = "";

    request.on("data", part => {
        body += part;
    });

    request.on("end", () => {
        let willDelete;
        try {
            willDelete = JSON.parse(body);
        }
        catch {
            return response.end("Error: body is not proper JSON format.");
        };

        fs.access('./db.json', fs.constants.F_OK, (error) => {
            if (error) {
                return response.end("Error: db.json not found");
            }

            fs.readFile('./db.json', 'utf8', (error, data) => {
                if (error) {
                    return response.end("Error reading db.json");
                }

                let db = JSON.parse(data);

                for (let key in willDelete) {
                    if (willDelete[key] === true && db.hasOwnProperty(key)) {
                        delete db[key];
                    };
                };

                fs.writeFile('./db.json', JSON.stringify(db, null, 2), (error) => {
                    if (error) {
                        return response.end("Error writing to db.json");
                    }

                    response.setHeader("Content-Type", "application/json");
                    response.end(JSON.stringify(db, null, 2));
                });

            });
        });
    });
});

// Notify that server is running
server.listen(port, () => {
    console.log(`example1 is running on port http://localhost:${port}`);
})