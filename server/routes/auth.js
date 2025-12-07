import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });
  try {
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length) return res.status(409).json({ error: "Email déjà utilisé" });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query("INSERT INTO users (email, password_hash) VALUES (?, ?)", [email, hash]);
    const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET || "change-me", { expiresIn: "7d" });
    res.json({ token, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ error: "Identifiants invalides" });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides" });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "change-me", { expiresIn: "7d" });
    res.json({ token, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
