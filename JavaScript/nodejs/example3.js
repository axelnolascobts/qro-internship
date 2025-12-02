// Implement a server that integrates an .mp4 using streams
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const stat = fs.statSync('./HARINA.mp4');
    const total = stat.size;

    const range = req.headers.range;

    if (range) {
        const [startStr, endStr] = range.replace("bytes=", "").split("-");
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : total - 1;

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${total}`,
            "Accept-Ranges": "bytes",
            "Content-Length": (end - start + 1),
            "Content-Type": "video/mp4"
        });

        fs.createReadStream('./HARINA.mp4', { start, end }).pipe(res);
    }
    else {
        res.writeHead(200, {
            "Content-Length": total,
            "Content-Type": "video/mp4"
        });

        fs.createReadStream('./HARINA.mp4').pipe(res);
    }
});

// Notify that server is running
server.listen(3003, () =>
    console.log("example3 running on http://localhost:3003")
);
