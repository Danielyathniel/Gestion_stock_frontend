import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Boxes,
  FolderTree,
  ArrowDownToLine,
  ArrowUpFromLine,
  PackageX,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { fetchDashboard } from "../services/dashboardService";
import "./DashboardPage.css";

const COLORS = ["#2e6350", "#7db89a", "#c98a5e", "#e0b854", "#6b8f71", "#4a7c8f"];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const result = await fetchDashboard();
      setData(result);
    } catch {
      setError("Impossible de charger le tableau de bord.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content">
          <p>Chargement du tableau de bord…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content">
          <p className="dashboard-error">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Articles", value: data.totalArticles, icon: Boxes, to: "/articles", color: "#2e6350" },
    { label: "Catégories", value: data.totalCategories, icon: FolderTree, to: "/categories", color: "#4a7c8f" },
    { label: "Entrées", value: data.totalEntrees, icon: ArrowDownToLine, to: "/mouvements/entrees", color: "#5a8f6a" },
    { label: "Sorties", value: data.totalSorties, icon: ArrowUpFromLine, to: "/mouvements/sorties", color: "#c98a5e" },
    { label: "Valeur du stock", value: `${data.valeurStock.toLocaleString("fr-FR")} F`, icon: Wallet, color: "#6b5b95" },
    { label: "En rupture", value: data.enRupture, icon: PackageX, color: "#b23a34" },
    { label: "Presque en rupture", value: data.presqueRupture, icon: AlertTriangle, color: "#c4882f" },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-subtitle">Vue d'ensemble de ton stock.</p>

        <div className="stat-grid">
          {stats.map((s) => {
            const Icon = s.icon;
            const style = { "--stat-color": s.color };
            if (s.to) {
              return (
                <Link key={s.label} to={s.to} className="stat-card stat-card--link" style={style}>
                  <div className="stat-card-top">
                    <Icon size={18} className="stat-card-icon" />
                    <span className="stat-label">{s.label}</span>
                  </div>
                  <span className="stat-value">{s.value}</span>
                </Link>
              );
            }
            return (
              <div key={s.label} className="stat-card stat-card--static" style={style}>
                <div className="stat-card-top">
                  <Icon size={18} className="stat-card-icon" />
                  <span className="stat-label">{s.label}</span>
                </div>
                <span className="stat-value">{s.value}</span>
              </div>
            );
          })}
        </div>

        <div className="chart-grid">
          <div className="chart-card">
  <h2 className="chart-title">Entrées vs sorties (7 derniers jours)</h2>
  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={data.evolution}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="entrees" fill="#2e6350" radius={[6, 6, 0, 0]} name="Entrées" />
      <Bar dataKey="sorties" fill="#c98a5e" radius={[6, 6, 0, 0]} name="Sorties" />
    </BarChart>
  </ResponsiveContainer>
</div>

          <div className="chart-card">
            <h2 className="chart-title">Stock par catégorie</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.stockParCategorie}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categorie" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="stock" fill="#2e6350" radius={[6, 6, 0, 0]} name="Quantité" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2 className="chart-title">Répartition du stock par catégorie</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.stockParCategorie}
                  dataKey="stock"
                  nameKey="categorie"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {data.stockParCategorie.map((entry, i) => (
                    <Cell key={entry.categorie} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}