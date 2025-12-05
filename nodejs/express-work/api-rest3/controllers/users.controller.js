import { readFile, writeFile } from "fs/promises";
const dbPath = "./db/users.json";

// Helper functions
async function readDB() {
    const data = await readFile(dbPath, "utf-8");
    return JSON.parse(data);
}

async function writeDB(data) {
    await writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

async function getNextId(list) {
    return list.length ? Math.max(...list.map(i => i.id)) + 1 : 1;
}

//----------------------------------------------------------
// GET ALL method
export async function getAllUsers(request, response) {
    const { users } = await readDB();
    response.json(users);
}

// GET by Id method
export async function getUserById(request, response) {
    const { id } = request.params;
    const { users } = await readDB();
    const user = users.find(u => u.id == id);
    user ? response.json(user) : response.sendStatus(404);
}

// POST method
export async function createUser(request, response) {
    const { name, age } = request.body;

    if (!name || !age) {
        return response.status(400).json({ error: "Invalid body" });
    }

    const db = await readDB();
    const newUser = {
        id: await getNextId(db.users),
        name,
        age
    };
    db.users.push(newUser);
    await writeDB(db);

    response.status(201).json(newUser);
}

// PUT method
export async function updateUser(request, response) {
    const { id } = request.params;
    const { name, age } = request.body;

    if (!name || !age) {
        return response.status(400).json({ error: "Invalid body" });
    }

    const db = await readDB();
    const index = db.users.findIndex(u => u.id == id);

    if (index === -1) {
        return response.sendStatus(404);
    }

    db.users[index] = { id: Number(id), name, age };
    await writeDB(db);

    response.json(db.users[index]);
};

// PATCH method
export async function patchUser(request, response) {
    const { id } = request.params;
    const body = request.body;

    const db = await readDB();
    const user = db.users.find(u => u.id == id);

    if (!user) {
        return response.sendStatus(404);
    }

    Object.assign(user, body);
    await writeDB(db);
    response.json(user);
};

// DELETE method
export async function deleteUser(request, response) {
    const { id } = request.params;
    const db = await readDB();
    db.users = db.users.filter(u => u.id != id);
    await writeDB(db);
    response.sendStatus(204);
};