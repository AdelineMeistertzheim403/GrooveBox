import { useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "../../state/authAtom";
import { login, register } from "../../api/backend";
import "./AuthPanel.css";

export default function AuthPanel() {
  const [user, setUser] = useAtom(userAtom);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    setLoading(true);
    setMessage("");
    try {
      const fn = mode === "login" ? login : register;
      const res = await fn(email, password);
      setUser({ token: res.token, email: res.email });
      setMessage(mode === "login" ? "Connecté" : "Compte créé");
      setPassword("");
    } catch (e) {
      setMessage(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser({ token: null, email: null });
    setMessage("Déconnecté");
  }

  if (user?.token) {
    return (
      <div className="auth-panel">
        <div>
          <div className="auth-status">Connecté : {user.email}</div>
          <button className="auth-btn secondary" onClick={logout}>
            Se déconnecter
          </button>
        </div>
        {message && <div className="auth-msg">{message}</div>}
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <div className="auth-tabs">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
          Connexion
        </button>
        <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
          Inscription
        </button>
      </div>
      <div className="auth-fields">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="auth-btn" onClick={submit} disabled={loading || !email || !password}>
          {loading ? "..." : mode === "login" ? "Se connecter" : "Créer un compte"}
        </button>
        {message && <div className="auth-msg">{message}</div>}
      </div>
    </div>
  );
}
