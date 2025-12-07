import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import patternRoutes from "./routes/patterns.js";
import { initTables } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"], credentials: false }));
app.use(express.json({ limit: "10mb", type: ["application/json", "text/plain"] }));

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "groovebox-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/patterns", patternRoutes);

initTables().then(() => {
  app.listen(PORT, () => {
    console.log(`API GrooveBox sur http://localhost:${PORT}`);
  });
});
