import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Tableau de bord", icon: "▦", end: true },
  { to: "/categories", label: "Catégories", icon: "▤" },
  { to: "/articles", label: "Articles", icon: "◧" },
  { to: "/mouvements", label: "Mouvements", icon: "⇄" },
  { to: "/rapports", label: "Rapports", icon: "▥" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar no-print">
      <div className="brand">
        <span className="brand-mark">SF</span>
        StockFlow
      </div>
      <nav className="nav-group">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        Données simulées en local
        <br />
        prêtes pour l'API Laravel.
      </div>
    </aside>
  );
}
