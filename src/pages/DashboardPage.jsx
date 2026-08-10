import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import RefTag from "../components/RefTag";
import StockBadge from "../components/StockBadge";
import { useToast } from "../context/ToastContext";
import * as dashboardApi from "../api/dashboardApi";

function formatMoney(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " F";
}

export default function DashboardPage() {
  const { notify } = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardApi
      .getDashboardData()
      .then(setData)
      .catch((err) => notify(err.message, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) return <p style={{ color: "var(--color-ink-soft)" }}>Chargement du tableau de bord...</p>;

  const { stats, evolution, stockParCategorie, alertes } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Tableau de bord</h2>
          <p>Vue d'ensemble de l'état du stock.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Articles" value={stats.totalArticles} />
        <StatCard label="Catégories" value={stats.totalCategories} />
        <StatCard label="Entrées enregistrées" value={stats.totalEntrees} accent />
        <StatCard label="Sorties enregistrées" value={stats.totalSorties} />
        <StatCard label="Valeur totale du stock" value={formatMoney(stats.valeurStock)} wide />
        <StatCard label="Articles presque en rupture" value={stats.faible} tone="warning" />
        <StatCard label="Articles en rupture" value={stats.rupture} tone="danger" />
      </div>

      <div className="charts-grid" style={{ marginBottom: 20 }}>
        <div className="card card-pad">
          <h2 style={{ fontSize: 15, marginBottom: 4 }}>Entrées vs sorties</h2>
          <p style={{ fontSize: 12.5, color: "var(--color-ink-soft)", marginBottom: 14 }}>
            Quantités mouvementées sur les 7 derniers jours
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={evolution}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-ink-soft)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--color-ink-soft)" allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="Entrées" stroke="#2F6F5E" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Sorties" stroke="#C1443A" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-pad">
          <h2 style={{ fontSize: 15, marginBottom: 4 }}>Stock par catégorie</h2>
          <p style={{ fontSize: 12.5, color: "var(--color-ink-soft)", marginBottom: 14 }}>
            Quantité disponible, toutes unités confondues
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stockParCategorie}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="categorie" tick={{ fontSize: 12 }} stroke="var(--color-ink-soft)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--color-ink-soft)" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="stock" fill="#2F6F5E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Alertes de stock</h2>
          <Link to="/articles" className="btn btn-ghost btn-sm">
            Voir tous les articles
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Article</th>
                <th>Stock actuel</th>
                <th>Seuil minimum</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {alertes.map((a) => (
                <tr key={a.id}>
                  <td>
                    <RefTag>{a.reference}</RefTag>
                  </td>
                  <td style={{ fontWeight: 600 }}>{a.nom}</td>
                  <td>{a.stock_actuel}</td>
                  <td>{a.stock_minimum}</td>
                  <td>
                    <StockBadge statut={a.statut} />
                  </td>
                </tr>
              ))}
              {alertes.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <h3>Aucune alerte</h3>
                      <p>Tous les articles sont au-dessus de leur seuil minimum.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, tone, wide }) {
  const cls = ["stat-card", accent && "accent", tone].filter(Boolean).join(" ");
  return (
    <div className={cls} style={wide ? { gridColumn: "span 2" } : undefined}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
