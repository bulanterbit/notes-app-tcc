import express from "express";
import cors from "cors";
import routes from "./controller.js";
import { connectToDatabase } from "./database.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api", routes);

app.listen(PORT, async () => {
  console.log(`backend is running on http://localhost:${PORT}`);
  await connectToDatabase();
});

export default app;
