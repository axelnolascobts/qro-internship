// Each time a request arrives, read the JSON
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {

    const json = JSON.parse(fs.readFileSync('./readable.json', 'utf8'));

    const taglib = json["web-app"].taglib;

    const count = Object.keys(taglib).length + 1;
    taglib[`request${count}`] = Date.now();

    fs.writeFileSync('./readable.json', JSON.stringify(json, null, 2));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(json, null, 2));
});

// Notify that server is running
server.listen(3002, () => console.log("example2 running on http://localhost:3002"));
