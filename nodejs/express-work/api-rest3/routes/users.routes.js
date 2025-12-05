import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    patchUser,
    deleteUser
} from "../controllers/users.controller.js";

const router = Router();
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id", patchUser);
router.delete("/:id", deleteUser);

export default router;