import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5050;
const DB_FILE = path.join(__dirname, "db.json");

async function readDatabase() {
  try {
    const data = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { users: [] };
  }
}

async function writeDatabase(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to database:", error);
    throw error;
  }
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function getNextId() {
  const db = await readDatabase();
  if (db.users.length === 0) {
    return 1;
  }
  const maxId = Math.max(...db.users.map(user => user.id));
  return maxId + 1;
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;
  const pathname = url.pathname;

  try {
    if (pathname === "/users") {
      if (method === "POST") {
        const body = await parseRequestBody(req);
        const { name, age } = body;

        if (!name || age === undefined) {
          return sendJSON(res, 400, { error: "Name and age are required." });
        }

        const data = await readDatabase();
        const id = await getNextId();

        const newUser = { id, name, age };
        data.users.push(newUser);

        await writeDatabase(data);

        return sendJSON(res, 201, newUser);
      }
      if (method === "GET") {
        const db = await readDatabase();
        return sendJSON(res, 200, db.users);
      }
    }

    if (pathname.startsWith("/users/")) {
      const id = parseInt(pathname.split('/')[2]);
      if (method === "GET") {
        const db = await readDatabase();

        const user = db.users.find(user => user.id === id);

        if (!user) {
          return sendJSON(res, 404, { error: "User not found." });
        }
        return sendJSON(res, 200, user);
      }
      if (method === "PUT") {
        const body = await parseRequestBody(req);
        const { name, age } = body;

        if (!name || age === undefined) {
          return sendJSON(res, 400, { error: "Name and age are required." });
        }

        const db = await readDatabase();
        const userIndex = db.users.findIndex(user => user.id === id);

        if (userIndex === -1) {
          return sendJSON(res, 404, { error: "User not found." });
        }
        db.users[userIndex] = { id, name, age };
        await writeDatabase(db);
        return sendJSON(res, 200, db.users[userIndex]);
      }
      if (method === "PATCH") {
        const updates = await parseRequestBody(req);

        if (!updates || Object.keys(updates).length === 0) {
          return sendJSON(res, 400, { error: "At least one property is required." });
        }

        const validProperties = ["name", "age"];
        const invalidProperties = Object.keys(updates).filter(key => !validProperties.includes(key));

        if (invalidProperties.length > 0) {
          return sendJSON(res, 400, { error: `Invalid properties: ${invalidProperties.join(", ")}` });
        }

        const db = await readDatabase();
        const userIndex = db.users.findIndex(user => user.id === id);

        if (userIndex === -1) {
          return sendJSON(res, 404, { error: "User not found." });
        }

        db.users[userIndex] = { ...db.users[userIndex], ...updates };

        await writeDatabase(db);

        return sendJSON(res, 200, db.users[userIndex]);
      }

      if (method === "DELETE") {
        const db = await readDatabase();
        const userIndex = db.users.findIndex(user => user.id === id);

        if (userIndex === -1) {
          return sendJSON(res, 404, { error: "User not found." });
        }

        db.users.splice(userIndex, 1);
        await writeDatabase(db);
        res.writeHead(204);
        res.end();
        return;
      }
      sendJSON(res, 404, { error: "Not found" });
    }
  } catch (error) {
    console.error("Request error:", error);
    sendJSON(res, 500, { error: "Interval server error" });
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});