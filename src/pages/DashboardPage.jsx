import "./DashboardPage.css";

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-subtitle">Vue d'ensemble de ton stock.</p>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Articles</span>
            <span className="stat-value">—</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Catégories</span>
            <span className="stat-value">—</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Stock bas</span>
            <span className="stat-value">—</span>
          </div>
        </div>

        <p className="page-note">Les vraies statistiques seront branchées à une prochaine étape.</p>
      </div>
    </div>
  );
}