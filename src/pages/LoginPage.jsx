import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const GRID_SIZE = 48;
// Une poignée de casiers "actifs" pour l'effet de grille vivante — valeurs figées
// pour que l'animation soit stable d'un rendu à l'autre.
const ACTIVE_CELLS = new Set([2, 5, 9, 14, 17, 22, 27, 31, 33, 38, 41, 45]);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
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

    // Toujours pas de vraie vérification de mot de passe contre un
    // backend — ça viendra plus tard. Pour l'instant on "connecte"
    // l'utilisateur avec l'email saisi et on file vers le tableau de bord.
    setTimeout(() => {
      setLoading(false);
      login(email);
      navigate("/");
    }, 900);
  }

  return (
    <div className="login-screen">
      <aside className="login-brand">
        <div className="login-brand-top">
          <span className="login-brand-mark">STOCKFLOW</span>
          <span className="login-brand-tag">SYSTÈME · GESTION DE STOCK</span>
        </div>

        <div className="login-grid" aria-hidden="true">
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <span
              key={i}
              className={`login-grid-cell${ACTIVE_CELLS.has(i) ? " is-active" : ""}`}
              style={{ animationDelay: `${(i % 12) * 0.35}s` }}
            />
          ))}
        </div>

        <div className="login-brand-bottom">
          <p className="login-brand-headline">
            Chaque casier compte.<br />Sache toujours ce qu'il y a dedans.
          </p>
          <p className="login-brand-sub">
            Suivi des articles, mouvements et alertes de stock en un seul endroit.
          </p>
        </div>
      </aside>

      <main className="login-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card-head">
            <h1>Connexion</h1>
            <p>Accède à ton espace de gestion de stock.</p>
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
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </label>

          {error && <p className="login-message login-message-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Connexion en cours…" : "Se connecter"}
          </button>
        </form>
      </main>
    </div>
  );
}