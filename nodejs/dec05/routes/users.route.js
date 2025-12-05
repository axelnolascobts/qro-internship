import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser
} from "../controllers/users.controller.js";
import { validateUser } from "../middleware/users.middleware.js";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", validateUser, createUser);
router.put("/:id", validateUser, updateUser);
router.patch("/:id", patchUser);
router.delete("/:id", deleteUser);

export default router;