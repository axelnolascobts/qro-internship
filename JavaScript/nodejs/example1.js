// Reads a .json file and returns it as text
const http = require('http');
const fs = require('fs');

// Make server
const server = http.createServer((request, response) => {
    // Read file into data
    const data = fs.readFileSync('./readable.json', 'utf8');

    // Write out as text
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end(data);
});

// Notify that server is running
server.listen(3001, () => {
    console.log("example1 is running on port http://localhost:3001");
})