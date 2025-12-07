import { Router } from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, created_at, updated_at FROM patterns WHERE user_id = ? ORDER BY updated_at DESC", [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, data FROM patterns WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "Pattern introuvable" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", async (req, res) => {
  const body = req.body || {};
  const safeName = (body.name || "").trim();
  let payload = body.data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      // keep as string
    }
  }
  if (!safeName) return res.status(400).json({ error: "Nom et data requis" });
  if (payload === undefined || payload === null) payload = {};
  try {
    const [result] = await pool.query("INSERT INTO patterns (user_id, name, data) VALUES (?, ?, ?)", [
      req.user.id,
      safeName,
      JSON.stringify(payload),
    ]);
    res.json({ id: result.insertId, name: safeName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", async (req, res) => {
  const body = req.body || {};
  const safeName = (body.name || "").trim();
  let payload = body.data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      // keep as string
    }
  }
  if (!safeName) return res.status(400).json({ error: "Nom et data requis" });
  if (payload === undefined || payload === null) payload = {};
  try {
    const [result] = await pool.query(
      "UPDATE patterns SET name = ?, data = ? WHERE id = ? AND user_id = ?",
      [safeName, JSON.stringify(payload), req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Pattern introuvable" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
