import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/courses", courseRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] Curio API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("[server] failed to start:", err.message);
    process.exit(1);
  });
