const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5001;
const DB_FILE = path.join(__dirname, "db.json");

const server = http.createServer((req, res) => {
  if (req.method !== "GET") {
    console.error(`${req.method} requests are not permitted. Please use GET requests.`);
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `${req.method} requests are not permitted. Please use GET requests.` }))
    return;
  }

  fs.readFile(DB_FILE, "utf-8", (err, data) => {
    if (err) {
      console.error(err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Error reading db.json" }));
      return;
    }
    if (!data || data.trim() === "") {
      console.error("The file, db.json, is empty.");
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "The file, db.json, is empty." }));
      return;
    }
    try {
      JSON.parse(data);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
      console.log("Data sent successfully.");
    } catch (err) {
      console.error("db.json has invalid JSON format.");
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "db.json has invalid JSON format." }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`GET Server started on http://localhost:${PORT}`);
});