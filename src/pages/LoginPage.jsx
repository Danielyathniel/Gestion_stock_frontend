import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import { Package } from "lucide-react";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Renseigne ton email et ton mot de passe.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Cet email ne semble pas valide.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await authService.login(email, password);

      if (result.success) {
        login(result.user);
        navigate("/");
      } else {
        setError(result.message || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      setError("Erreur de connexion. Vérifie que le serveur est démarré.");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <main className="login-card-wrap">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card-head">
            <div className="login-brand-icon">
              <Package size={28} strokeWidth={1.5} />
            </div>
            <h1>StockFlow</h1>
            <p>Connecte-toi pour gérer ton stock.</p>
          </div>

          <label className="login-field">
            <span className="login-field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@entreprise.com"
              autoComplete="email"
            />
          </label>

          <label className="login-field">
            <span className="login-field-label">Mot de passe</span>
            <div className="login-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error && <p className="login-message login-message-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            <Package size={18} />
            {loading ? "Connexion en cours…" : "Se connecter"}
          </button>

          <p className="login-footer">Gestion de stock</p>
        </form>
      </main>
    </div>
  );
}
