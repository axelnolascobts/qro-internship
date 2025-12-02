const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3051;
const JSON_FILE = path.join(__dirname, "readable.json");

let requestCounter = 0;

const server = http.createServer((req, res) => {
  requestCounter++;
  const requestId = `request${requestCounter}`;

  fs.readFile(JSON_FILE, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end("Error reading file:", err.message);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      if (!jsonData["web-app"]) {
        jsonData["web-app"] = {};
      }
      if (!jsonData["web-app"].taglib) {
        jsonData["web-app"].taglib = {};
      }
      jsonData["web-app"].taglib[requestId] = new Date().toISOString();

      const updatedJSON = JSON.stringify(jsonData, null, 2);

      fs.writeFile(JSON_FILE, updatedJSON, "utf8", (err) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Error writing to file:" + err.message }));
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          message: "Property added successfully.",
          propertyAdded: requestId
        }, null, 2));
      });
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Error parsing JSON" }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server for example2 is running on http://localhost:${PORT}`);
});