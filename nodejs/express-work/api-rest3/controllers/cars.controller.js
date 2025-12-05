import { readFile, writeFile } from "fs/promises";
const dbPath = "./db/cars.json";

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
export async function getAllCars(request, response) {
    const { cars } = await readDB();
    const { type } = request.query;

    if (type) {
        return response.json(cars.filter(car => car.type === type));
    }
    response.json(cars);
};

// GET by Id method
export async function getCarById(request, response) {
    const { id } = request.params;
    const { cars } = await readDB();
    const car = cars.find(c => c.id == id);
    car ? response.json(car) : response.sendStatus(404);
}

// POST method
export async function createCar(request, response) {
    const { brand, type } = request.body;

    if (!brand || !type) {
        return response.status(400).json({ error: "Invalid body" });
    }

    const db = await readDB();
    const newCar = {
        id: await getNextId(db.cars),
        brand,
        type
    };
    db.cars.push(newCar);
    await writeDB(db);

    response.status(201).json(newCar);
}

// PUT method
export async function updateCar(request, response) {
    const { id } = request.params;
    const { brand, type } = request.body;

    if (!brand || !type) {
        return response.status(400).json({ error: "Invalid body" });
    }

    const db = await readDB();
    const index = db.cars.findIndex(c => c.id == id);

    if (index === -1) {
        return response.sendStatus(404);
    }

    db.cars[index] = { id: Number(id), brand, type };
    await writeDB(db);

    response.json(db.cars[index]);
};

// PATCH method
export async function patchCar(request, response) {
    const { id } = request.params;
    const body = request.body;

    const db = await readDB();
    const car = db.cars.find(c => c.id == id);

    if (!car) {
        return response.sendStatus(404);
    }

    Object.assign(car, body);
    await writeDB(db);
    response.json(car);
};

// DELETE method
export async function deleteCar(request, response) {
    const { id } = request.params;
    const db = await readDB();
    db.cars = db.cars.filter(c => c.id != id);
    await writeDB(db);
    response.sendStatus(204);
};