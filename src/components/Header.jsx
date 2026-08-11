import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const NOTIFICATIONS = [
  { id: 1, text: "Stock bas : Câble USB-C (4 unités restantes)" },
  { id: 2, text: "Nouvelle entrée de stock enregistrée" },
];

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
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div />

      <div className="header-actions">
        <div className="header-notif-wrap">
          {/*<button
            type="button"
            className="header-icon-btn"
            onClick={() => {
              setNotifOpen((v) => !v);
              setMenuOpen(false);
            }}
            aria-label="Notifications"
          >
            🔔
            {NOTIFICATIONS.length > 0 && (
              <span className="header-badge">{NOTIFICATIONS.length}</span>
            )}
          </button>  */}

          {notifOpen && (
            <div className="header-dropdown">
              <p className="header-dropdown-title">Notifications</p>
              {NOTIFICATIONS.map((n) => (
                <p key={n.id} className="header-notif-item">
                  {n.text}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="header-user-wrap">
          <button
            type="button"
            className="header-user-chip"
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <span className="header-avatar">{initials(user?.name || "?")}</span>
            <span className="header-user-name">{user?.name}</span>
          </button>

          {menuOpen && (
            <div className="header-dropdown">
              <p className="header-dropdown-email">{user?.email}</p>
              <button type="button" className="header-logout" onClick={logout}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}