import express from "express";
import usersRouter from "./routes/users.routes.js";
import carsRouter from "./routes/cars.routes.js";

const app = express();
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/cars", carsRouter);

const port = 5001;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

export default app;