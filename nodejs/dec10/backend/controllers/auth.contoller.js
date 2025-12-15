import {
  comparePassword,
  generateToken,
  hashPassword
} from "../utils/auth.util.js";
import { readJSON, writeJSON } from "../utils/fileHandler.js";

export const registerController = async (req, res) => {
  try {
    const { name, lastname, email, password, birthdate, address, role = "customer" } = req.body;

    if (!name || !lastname || !email || !password || !birthdate || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const users = await readJSON("users.json");

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: Date.now().toString(),
      name,
      lastname,
      email,
      password: hashedPassword,
      birthdate,
      address,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeJSON("users.json", users);

    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Register controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = await readJSON("users.json");
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const validateController = async (req, res) => {
  try {
    const users = await readJSON("users.json");
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Validate controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}