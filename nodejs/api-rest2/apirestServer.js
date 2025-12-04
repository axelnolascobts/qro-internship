// Import http and fs
const http = require('http');
const fs = require('fs');
const url = require('url');

// Set port & path
const port = 5001;
const dbPath = './db.json';

// For reading the databases
function readDB(response) {
    fs.readFile(dbPath, 'utf8', (error, content) => {
        if (error) {
            return response.end("Error reading db.json");
        }
        if (!content.trim()) {
            return response.end("Error: db.json is empty")
        }

        response.setHeader('Content-Type', 'application/json');
        response.end(content);
    });
};

// For writing in the databases
function writeDB(data, response, statusCode = 200) {
    fs.writeFile(dbPath, JSON.stringify(data, null, 2), (error) => {
        if (error) {
            return response.end("Error writing to db.json");
        }

        response.statusCode = statusCode;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(data));
    });
};

// Helper functions for users array API
function getNextId(users) {
    if (users.length === 0) return 1;
    return Math.max(...users.map(user => user.id)) + 1;
}

function findUserById(users, id) {
    return users.find(user => user.id === parseInt(id));
}

function validateUserObject(obj) {
    return obj.hasOwnProperty('name') && 
           obj.hasOwnProperty('age');
}

// The server
const server = http.createServer((request, response) => {
    const method = request.method;
    const parsedURL = url.parse(request.url, true);
    const query = parsedURL.query;

    fs.access(dbPath, fs.constants.F_OK, (error) => {
        // Check if db exists. Only post can be used on empty db
        if (error && method !== "POST") {
            return response.end("Error: db.json does not exist.");
        }

        // GET all or by ID
        if (method === 'GET') {
            return fs.readFile(dbPath, 'utf8', (error, content) => {
                if (error) {
                    return response.end("Error reading db.json");
                }
                if (!content.trim()) {
                    return response.end("Error: db.json is empty");
                }

                let db;
                try {
                    db = JSON.parse(content);
                    // Handle migration from old format to new format
                    if (!db.hasOwnProperty('users')) {
                        db = { users: [] };
                    }
                } catch {
                    return response.end("Error: Invalid JSON in db.json");
                }

                // Check if id parameter is provided
                if (query.id) {
                    const user = findUserById(db.users, query.id);
                    if (!user) {
                        response.statusCode = 404;
                        return response.end(`Error: User with id ${query.id} not found.`);
                    }
                    response.setHeader('Content-Type', 'application/json');
                    return response.end(JSON.stringify(user, null, 2));
                }

                // Return all users
                response.setHeader('Content-Type', 'application/json');
                return response.end(JSON.stringify(db.users, null, 2));
            });
        }

        // Body for manipulating db
        let body = "";
        request.on("data", part => body += part);
        request.on("end", () => {
            let json;
            // Place parsed data into json var & Check if valid JSON format
            if (body.trim().length === 0) {
                json = {};
            }
            else {
                try {
                    json = JSON.parse(body);
                }
                catch {
                    return response.end("Error: body is not valid JSON.");
                }
            }

            // POST method
            if (method === "POST") {
                return fs.readFile(dbPath, 'utf8', (error, data) => {
                    if (error) {
                        // If file doesn't exist, create new db with users array
                        if (error.code === 'ENOENT') {
                            const db = { users: [] };
                            if (!validateUserObject(json)) {
                                return response.end("Error: POST body must have name and age properties.");
                            }
                            const newUser = {
                                id: getNextId([]),
                                name: json.name,
                                age: json.age
                            };
                            db.users.push(newUser);
                            fs.writeFile(dbPath, JSON.stringify(db, null, 2), (error) => {
                                if (error) {
                                    return response.end("Error writing to db.json");
                                }
                                response.statusCode = 201;
                                response.setHeader('Content-Type', 'application/json');
                                response.end(JSON.stringify(newUser));
                            });
                        }
                        return response.end("Error reading db.json");
                    }

                    let db;
                    try {
                        db = JSON.parse(data);
                        // Handle migration from old format to new format
                        if (!db.hasOwnProperty('users')) {
                            db = { users: [] };
                        }
                    } catch {
                        db = { users: [] };
                    }

                    if (!validateUserObject(json)) {
                        return response.end("Error: POST body must have name and age properties.");
                    }

                    const newUser = {
                        id: getNextId(db.users),
                        name: json.name,
                        age: json.age
                    };

                    db.users.push(newUser);
                    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (error) => {
                        if (error) {
                            return response.end("Error writing to db.json");
                        }
                        response.statusCode = 201;
                        response.setHeader('Content-Type', 'application/json');
                        response.end(JSON.stringify(newUser));
                    });
                });
            }

            // PUT method
            if (method === "PUT") {
                if (!query.id) {
                    return response.end("Error: PUT requires id parameter in URL.");
                }

                return fs.readFile(dbPath, 'utf8', (error, data) => {
                    if (error) {
                        return response.end("Error reading db.json");
                    }

                    let db;
                    try {
                        db = JSON.parse(data);
                        if (!db.hasOwnProperty('users')) {
                            db = { users: [] };
                        }
                    } catch {
                        return response.end("Error: Invalid JSON in db.json");
                    }

                    if (!validateUserObject(json)) {
                        return response.end("Error: PUT body must have name and age properties.");
                    }

                    const userIndex = db.users.findIndex(user => user.id === parseInt(query.id));
                    if (userIndex === -1) {
                        response.statusCode = 404;
                        return response.end(`Error: User with id ${query.id} not found.`);
                    }

                    // Update all properties of the user
                    const updatedUser = {
                        id: parseInt(query.id),
                        name: json.name,
                        age: json.age
                    };
                    db.users[userIndex] = updatedUser;

                    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (error) => {
                        if (error) {
                            return response.end("Error writing to db.json");
                        }
                        response.setHeader('Content-Type', 'application/json');
                        response.end(JSON.stringify(updatedUser));
                    });
                });
            }

            // PATCH method
            if (method === "PATCH") {
                if (!query.id) {
                    return response.end("Error: PATCH requires id parameter in URL.");
                }

                return fs.readFile(dbPath, 'utf8', (error, data) => {
                    if (error) {
                        return response.end("Error reading db.json");
                    }

                    let db;
                    try {
                        db = JSON.parse(data);
                        if (!db.hasOwnProperty('users')) {
                            db = { users: [] };
                        }
                    } catch {
                        return response.end("Error: Invalid JSON in db.json");
                    }

                    const bodyKeys = Object.keys(json);
                    // Validate 1 to 3 properties
                    if (bodyKeys.length === 0 || bodyKeys.length > 3) {
                        return response.end("Error: PATCH body must have between 1 and 3 properties.");
                    }

                    const userIndex = db.users.findIndex(user => user.id === parseInt(query.id));
                    if (userIndex === -1) {
                        response.statusCode = 404;
                        return response.end(`Error: User with id ${query.id} not found.`);
                    }

                    // Update only provided properties
                    bodyKeys.forEach((prop) => {
                        db.users[userIndex][prop] = json[prop];
                    });

                    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (error) => {
                        if (error) {
                            return response.end("Error writing to db.json");
                        }
                        response.setHeader('Content-Type', 'application/json');
                        response.end(JSON.stringify(db.users[userIndex]));
                    });
                });
            }

            // DELETE method
            if (method === "DELETE") {
                if (!query.id) {
                    return response.end("Error: DELETE requires id parameter in URL.");
                }

                return fs.readFile(dbPath, 'utf8', (error, data) => {
                    if (error) {
                        return response.end("Error reading db.json");
                    }

                    let db;
                    try {
                        db = JSON.parse(data);
                        if (!db.hasOwnProperty('users')) {
                            db = { users: [] };
                        }
                    } catch {
                        return response.end("Error: Invalid JSON in db.json");
                    }

                    const userIndex = db.users.findIndex(user => user.id === parseInt(query.id));
                    if (userIndex === -1) {
                        response.statusCode = 404;
                        return response.end(`Error: User with id ${query.id} not found.`);
                    }

                    // Remove user from array
                    db.users.splice(userIndex, 1);

                    // Write updated db and return empty response as required
                    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (error) => {
                        if (error) {
                            return response.end("Error writing to db.json");
                        }
                        // DELETE should return no content
                        response.statusCode = 204;
                        return response.end();
                    });
                });
            }

            // Catch any other methods that aren't above
            response.end("Method not supported.");
        })

    })
})

// Notify that server is running
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})