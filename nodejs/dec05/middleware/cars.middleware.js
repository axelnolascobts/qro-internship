export function validateCar(req, res, next) {
  const car = req.body;
  if (!car || typeof car !== "object") {
    return res.status(400).json({ error: "Invalid car object" });
  }
  if (car.brand && typeof car.brand !== "string") {
    return res.status(400).json({ error: "Brand must be a string" });
  }
  if (car.type && !["sedan", "hatchback"].includes(car.type)) {
    return res.status(400).json({ error: "Type must be sedan or hatchback" });
  }
  next();
}