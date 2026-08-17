import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.css";

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
  </svg>
);

const IconCategories = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
  </svg>
);

const IconArticles = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

const IconMovements = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v16" />
    <path d="M7 9l5-5 5 5" />
    <path d="M7 15l5 5 5-5" />
  </svg>
);

const IconChevron = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={`sidebar-chevron${open ? " is-open" : ""}`}
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const topLinks = [
  { to: "/", label: "Tableau de bord", end: true, icon: <IconDashboard /> },
  { to: "/categories", label: "Catégories", icon: <IconCategories /> },
  { to: "/articles", label: "Articles", icon: <IconArticles /> },
];

const movementLinks = [
  { to: "/mouvements/entrees", label: "Entrée de stock" },
  { to: "/mouvements/sorties", label: "Sortie de stock" },
];

export default function Sidebar() {
  const [movementsOpen, setMovementsOpen] = useState(true);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <span className="sidebar-brand-logo">SF</span>
          <span className="sidebar-brand-name">STOCKFLOW</span>
        </div>
        <p className="sidebar-brand-tag">Gestion de stock</p>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Navigation</span>

        {topLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `sidebar-link${isActive ? " is-active" : ""}`}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}

        <span className="sidebar-section-label">Mouvements</span>

        <button
          type="button"
          className="sidebar-group-toggle"
          onClick={() => setMovementsOpen((v) => !v)}
          aria-expanded={movementsOpen}
        >
          <span className="sidebar-link-icon">
            <IconMovements />
          </span>
          Mouvements de stock
          <IconChevron open={movementsOpen} />
        </button>

        <div className={`sidebar-subgroup-wrap${movementsOpen ? " is-open" : ""}`}>
          <div className="sidebar-subgroup">
            {movementLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `sidebar-sublink${isActive ? " is-active" : ""}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-footer-dot" />
        <span>StockFlow </span>
      </div>
    </aside>
  );
}
