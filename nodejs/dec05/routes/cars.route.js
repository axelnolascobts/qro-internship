import { Router } from "express";
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  patchCar,
  deleteCar
} from "../controllers/cars.controller.js";
import { validateCar } from "../middleware/cars.middleware.js"

const router = Router();

router.get("/", getCars);
router.get("/:id", getCarById);
router.post("/", validateCar, createCar);
router.put("/:id", validateCar, updateCar);
router.patch("/:id", patchCar);
router.delete("/:id", deleteCar);

export default router;