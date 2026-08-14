import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import brandImage from "../assets/login-brand-cutout.png";
import "./LoginPage.css";

const BACKGROUND_VIDEO =
  "https://videos.pexels.com/video-files/14910119/14910119-hd_1920_1080_24fps.mp4";

const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=60";

const BRAND_IMAGE = brandImage;

const BRAND_HEADLINE = "Chaque casier compte. Sache toujours ce qu'il y a dedans.";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}

function useTypewriter(text, { typeSpeed = 40, deleteSpeed = 16, pause = 2800 } = {}) {
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState("typing");
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(text);
      return;
    }

    let timer;
    if (phase === "typing") {
      if (display.length < text.length) {
        timer = setTimeout(() => setDisplay(text.slice(0, display.length + 1)), typeSpeed);
      } else {
        timer = setTimeout(() => setPhase("pausing"), pause);
      }
    } else if (phase === "pausing") {
      timer = setTimeout(() => setPhase("deleting"), 250);
    } else if (phase === "deleting") {
      if (display.length > 0) {
        timer = setTimeout(() => setDisplay(text.slice(0, display.length - 1)), deleteSpeed);
      } else {
        timer = setTimeout(() => setPhase("typing"), 500);
      }
    }

    return () => clearTimeout(timer);
  }, [display, phase, text, typeSpeed, deleteSpeed, pause, reducedMotion]);

  return display;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headline = useTypewriter(BRAND_HEADLINE);

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
      <div className="login-backdrop" aria-hidden="true">
        <video autoPlay muted loop playsInline poster={BACKGROUND_IMAGE}>
          <source src={BACKGROUND_VIDEO} type="video/mp4" />
        </video>
        <div className="login-backdrop-overlay" />
      </div>

      <aside className="login-brand">
        <div className="login-brand-top">
          <span className="login-brand-mark">STOCKFLOW</span>
          <span className="login-brand-tag">SYSTÈME · GESTION DE STOCK</span>
        </div>

        <img className="login-brand-art" src={BRAND_IMAGE} alt="" />

        <div className="login-brand-bottom">
          <p className="login-brand-headline">
            {headline}
            <span className="login-caret" aria-hidden="true" />
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