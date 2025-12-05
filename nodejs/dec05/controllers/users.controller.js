import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, "../db/users.json");

async function readUsers() {
  const data = await fs.readFile(USERS_FILE, "utf8");
  return JSON.parse(data);
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

function getNextId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
}

export const getUsers = async (req, res) => {
  try {
    const data = await readUsers();
    res.json(data.users);
  } catch (error) {
    res.status(500).json({ error: "Failed to read users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const data = await readUsers();
    const user = data.users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to read user" });
  }
};

export const createUser = async (req, res) => {
  try {
    const data = await readUsers();
    const newUser = {
      id: getNextId(data.users),
      ...req.body
    };
    data.users.push(newUser);
    await writeUsers(data);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const data = await readUsers();
    const userIndex = data.users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    data.users[userIndex] = { id: parseInt(req.params.id), ...req.body };
    await writeUsers(data);
    res.json(data.users[userIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const patchUser = async (req, res) => {
  try {
    const data = await readUsers();
    const userIndex = data.users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    data.users[userIndex] = { ...data.users[userIndex], ...req.body };
    await writeUsers(data);
    res.json(data.users[userIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const data = await readUsers();
    const userIndex = data.users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    const deletedUser = data.users.splice(userIndex, 1)[0];
    await writeUsers(data);
    res.json();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};