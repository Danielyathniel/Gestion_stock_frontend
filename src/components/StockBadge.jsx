const CONFIG = {
  ok: { label: "En stock", cls: "badge-ok" },
  faible: { label: "Stock faible", cls: "badge-warning" },
  rupture: { label: "Rupture", cls: "badge-danger" },
};

export default function StockBadge({ statut }) {
  const c = CONFIG[statut] || CONFIG.ok;
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
}
