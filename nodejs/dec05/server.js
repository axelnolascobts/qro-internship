import express from "express";
import userRoutes from "./routes/users.route.js";
import carRoutes from "./routes/cars.route.js";

const app = express();
const PORT = 5050;

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/cars", carRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});