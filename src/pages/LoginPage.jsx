import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@stockflow.test");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const dest = location.state?.from?.pathname || "/";
    return <Navigate to={dest} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-visual">
        <div className="brand" style={{ fontSize: 20 }}>
          <span className="brand-mark">SF</span>
          StockFlow
        </div>
        <div className="tagline">
          Chaque article, <span>tracé</span>.<br />
          Chaque mouvement, <span>signé</span>.
        </div>
        <div style={{ fontSize: 13, opacity: 0.6 }}>
          Gestion de stock — catégories, articles, entrées/sorties.
        </div>
      </div>
      <div className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Connexion</h2>
          <p>Accédez à votre espace de gestion de stock.</p>

          <div className="field">
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="field-error">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: "100%", justifyContent: "center" }}>
            {submitting ? "Connexion..." : "Se connecter"}
          </button>

          
        </form>
      </div>
    </div>
  );
}
