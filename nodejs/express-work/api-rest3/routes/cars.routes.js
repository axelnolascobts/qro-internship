import { Router } from "express";
import {
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    patchCar,
    deleteCar
} from "../controllers/cars.controller.js";

const router = Router();
router.get("/", getAllCars);
router.get("/:id", getCarById);
router.post("/", createCar);
router.put("/:id", updateCar);
router.patch("/:id", patchCar);
router.delete("/:id", deleteCar);

export default router;