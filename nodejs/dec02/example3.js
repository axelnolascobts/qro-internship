const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3052;
const VIDEO_FILE = path.join(__dirname, "HARINA.mp4");

const server = http.createServer((req, res) => {
  fs.stat(VIDEO_FILE, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Video not found");
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`Error accessing video: ${err.message}`);
      }
      return;
    }

    const fileSize = stats.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = (end - start) + 1;

      const fileStream = fs.createReadStream(VIDEO_FILE, { start, end });

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": 'bytes',
        "Content-Length": chunkSize,
        "Content-Type": 'video/mp4'
      };

      res.writeHead(200, headers);
      fileStream.pipe(res);

      fileStream.on("error", (err) => {
        console.error("Error streaming:", err);
        res.end();
      });
    } else {
      const headers = {
        "Content-Length": fileSize,
        "Content-Type": 'video/mp4',
        "Accept-Ranges": 'bytes'
      };
      res.writeHead(200, headers);

      const fileStream = fs.createReadStream(VIDEO_FILE);
      fileStream.pipe(res);

      fileStream.on("error", (err) => {
        console.error("Error streaming:", err);
        res.end();
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server for example3 is running on http://localhost:${PORT}`);
});