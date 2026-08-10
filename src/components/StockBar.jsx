const COLORS = {
  ok: "var(--color-accent)",
  faible: "var(--color-warning)",
  rupture: "var(--color-danger)",
};

export default function StockBar({ actuel, minimum, statut }) {
  const ceiling = Math.max(actuel, minimum * 2, 1);
  const pct = Math.min(100, Math.round((actuel / ceiling) * 100));
  const color = COLORS[statut] || COLORS.ok;

  return (
    <div className="stock-bar-wrap">
      <span className="stock-bar-label" style={{ color }}>
        {actuel}
      </span>
      <div className="stock-bar-track">
        <div className="stock-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
