const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5003;
const DB_FILE = path.join(__dirname, "db.json");

const server = http.createServer((req, res) => {
  if (req.method !== "PUT") {
    console.error(`${req.method} requests are not permitted. Please use PUT requests.`);
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `${req.method} requests are not permitted. Please use PUT requests.` }))
    return;
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk.toString();
  });

  req.on("end", () => {
    let updates = null;
    try {
      updates = JSON.parse(body);
    } catch (err) {
      console.error("Invalid JSON body.");
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON body." }));
      return;
    }

    fs.readFile(DB_FILE, "utf-8", (err, data) => {
      if (err) {
        console.error(err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Error reading db.json" }));
        return;
      }

      let currentData = null;
      try {
        currentData = JSON.parse(data);
      } catch (err) {
        console.error("db.json has invalid JSON format.");
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "db.json has invalid JSON format." }));
        return;
      }

      const updateKeys = Object.keys(updates);
      const existingKeys = Object.keys(currentData);

      for (let key of updateKeys) {
        if (!existingKeys.includes(key)) {
          console.error(`Property ${key} does not exist in db.json`);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Property ${key} does not exist in db.json` }));
          return;
        }
      }

      for (let key of updateKeys) {
        currentData[key] = updates[key];
      }

      fs.writeFile(DB_FILE, JSON.stringify(currentData, null, 2), "utf8", (err) => {
        if (err) {
          console.error("Unable to write to db.json", err.message);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Unable to write to db.json" }));
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(currentData, null, 2));
        console.log("Property was successfully updated in db.json");
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`PUT Server started on http://localhost:${PORT}`);
});