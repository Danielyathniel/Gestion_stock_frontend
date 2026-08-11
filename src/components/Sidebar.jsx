import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.css";

const topLinks = [
  { to: "/", label: "Tableau de bord", end: true },
  { to: "/categories", label: "Catégories" },
  { to: "/articles", label: "Articles" },
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
        <span className="sidebar-brand-mark">STOCKFLOW</span>
      </div>

      <nav className="sidebar-nav">
        {topLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `sidebar-link${isActive ? " is-active" : ""}`}
          >
            <span className="sidebar-dot" />
            {link.label}
          </NavLink>
        ))}

        <button
          type="button"
          className="sidebar-group-toggle"
          onClick={() => setMovementsOpen((v) => !v)}
          aria-expanded={movementsOpen}
        >
          <span className="sidebar-dot" />
          Mouvements de stock
          <span className={`sidebar-chevron${movementsOpen ? " is-open" : ""}`}>›</span>
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
    </aside>
  );
}