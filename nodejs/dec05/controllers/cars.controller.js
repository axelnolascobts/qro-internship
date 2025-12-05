import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CARS_FILE = path.join(__dirname, "../db/cars.json");

async function readCars() {
  const data = await fs.readFile(CARS_FILE, "utf8");
  return JSON.parse(data);
}

async function writeCars(cars) {
  await fs.writeFile(CARS_FILE, JSON.stringify(cars, null, 2));
}

function getNextId(items) {
  if (items.length === 0) {
    return 1;
  }
  return Math.max(...items.map(item => item.id)) + 1;
}

export const getCars = async (req, res) => {
  try {
    const data = await readCars();
    let cars = data.cars;

    if (req.query.type) {
      cars = cars.filter(car => car.type === req.query.type);
    }

    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: "Failed to read cars" });
  }
};

export const getCarById = async (req, res) => {
  try {
    const data = await readCars();
    const car = data.cars.find(c => c.id === parseInt(req.params.id));
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to read car" });
  }
};

export const createCar = async (req, res) => {
  try {
    const data = await readCars();
    const newCar = {
      id: getNextId(data.cars),
      brand: req.body.brand || "Unknown",
      type: req.body.type || "sedan",
      ...req.body
    };
    data.cars.push(newCar);
    await writeCars(data);
    res.status(201).json(newCar);
  } catch (error) {
    res.status(500).json({ error: "Failed to create car" });
  }
};

export const updateCar = async (req, res) => {
  try {
    const data = await readCars();
    const carIndex = data.cars.findIndex(c => c.id === parseInt(req.params.id));
    if (carIndex === -1) {
      return res.status(404).json({ error: "Car not found" });
    }
    data.cars[carIndex] = { id: parseInt(req.params.id), ...req.body };
    await writeCars(data);
    res.json(data.cars[carIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update car" });
  }
};

export const patchCar = async (req, res) => {
  try {
    const data = await readCars();
    const carIndex = data.cars.findIndex(c => c.id === parseInt(req.params.id));
    if (carIndex === -1) {
      return res.status(404).json({ error: "Car not found" });
    }
    data.cars[carIndex] = { ...data.cars[carIndex], ...req.body };
    await writeCars(data);
    res.json(data.cars[carIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update car" });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const data = await readCars();
    const carIndex = data.cars.findIndex(c => c.id === parseInt(req.params.id));
    if (carIndex === -1) {
      return res.status(404).json({ error: "Car not found" });
    }
    const deletedCar = data.cars.splice(carIndex, 1)[0];
    await writeCars(data);
    res.json();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete car" });
  }
};