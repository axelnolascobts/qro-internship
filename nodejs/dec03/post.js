const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5002;
const DB_FILE = path.join(__dirname, "db.json");

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    console.error(`${req.method} requests are not permitted. Please use POST requests.`);
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `${req.method} requests are not permitted. Please use POST requests.` }))
    return;
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk.toString();
  });

  req.on("end", () => {
    let jsonData = null;
    try {
      jsonData = JSON.parse(body);
    } catch (err) {
      console.error("Invalid JSON body.");
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON body." }));
      return;
    }

    fs.writeFile(DB_FILE, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
      if (err) {
        console.error("Unable to write to db.json", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unable to write to db.json" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(jsonData, null, 2));
      console.log("Data was successfully written to db.json");
    });
  });
});

server.listen(PORT, () => {
  console.log(`POST Server started on http://localhost:${PORT}`);
});