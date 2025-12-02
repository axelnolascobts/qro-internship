const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3050;
const JSON_FILE = path.join(__dirname, "readable.json");

const server = http.createServer((req, res) => {
  fs.readFile(JSON_FILE, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error reading file:", err.message);
      return;
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server for example1 is running on http://localhost:${PORT}`);
});