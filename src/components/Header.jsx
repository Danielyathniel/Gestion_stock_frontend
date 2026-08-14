import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const PAGE_TITLES = {
  "/": "Tableau de bord",
  "/categories": "Catégories",
  "/articles": "Articles",
  "/mouvements/entrees": "Entrée de stock",
  "/mouvements/sorties": "Sortie de stock",
};

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] ?? location.pathname;

  return (
    <header className="header">
      <div className="header-page">
        <span className="header-page-crumb">StockFlow</span>
        <span className="header-page-sep">/</span>
        <span className="header-page-title">{pageTitle}</span>
      </div>

      <div className="header-actions">
        <div className="header-user-wrap">
          <button
            type="button"
            className={`header-user-chip${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
          >
            <span className="header-avatar">{initials(user?.name || "?")}</span>
            <span className="header-user-name">{user?.name}</span>
            <svg className="header-user-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div className="header-dropdown">
              <div className="header-dropdown-user">
                <span className="header-avatar header-avatar-sm">{initials(user?.name || "?")}</span>
                <div className="header-dropdown-user-meta">
                  <p className="header-dropdown-name">{user?.name}</p>
                  <p className="header-dropdown-email">{user?.email}</p>
                </div>
              </div>
              <div className="header-dropdown-divider" />
              <button type="button" className="header-logout" onClick={logout}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
