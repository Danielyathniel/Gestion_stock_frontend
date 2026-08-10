import { useAuth } from "../context/AuthContext";

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Header({ title, subtitle }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar no-print">
      <div>
        <h1>{title}</h1>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
      {user && (
        <div className="user-chip">
          <div className="user-avatar">{initials(user.name)}</div>
          <div>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Déconnexion
          </button>
        </div>
      )}
    </header>
  );
}
