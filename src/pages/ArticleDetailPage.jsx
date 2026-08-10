import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RefTag from "../components/RefTag";
import StockBar from "../components/StockBar";
import StockBadge from "../components/StockBadge";
import { useToast } from "../context/ToastContext";
import * as articlesApi from "../api/articlesApi";
import * as movementsApi from "../api/movementsApi";

function formatMoney(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " F";
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [article, setArticle] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([articlesApi.getArticle(id), movementsApi.listMovements({ articleId: id })])
      .then(([a, m]) => {
        if (!active) return;
        setArticle(a);
        setMovements(m);
      })
      .catch((err) => notify(err.message, "error"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p style={{ color: "var(--color-ink-soft)" }}>Chargement...</p>;
  if (!article) {
    return (
      <div className="empty-state">
        <h3>Article introuvable</h3>
        <button className="btn btn-ghost" onClick={() => navigate("/articles")}>
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div>
      <Link to="/articles" style={{ fontSize: 13, color: "var(--color-ink-soft)", textDecoration: "none" }}>
        ← Retour aux articles
      </Link>

      <div className="page-header" style={{ marginTop: 10 }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {article.nom}
            <StockBadge statut={article.statut_stock} />
          </h2>
          <p>
            <RefTag>{article.reference}</RefTag> · {article.categorie_nom}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Stock actuel</div>
          <div className="stat-value">
            {article.stock_actuel} <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-ink-soft)" }}>{article.unite}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Seuil minimum</div>
          <div className="stat-value">{article.stock_minimum}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Prix d'achat</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{formatMoney(article.prix_achat)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Prix de vente</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{formatMoney(article.prix_vente)}</div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <StockBar actuel={article.stock_actuel} minimum={article.stock_minimum} statut={article.statut_stock} />
        {article.description && (
          <p style={{ marginTop: 14, color: "var(--color-ink-soft)", fontSize: 14 }}>{article.description}</p>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Historique des mouvements</h2>
          <Link className="btn btn-primary btn-sm" to="/mouvements">
            Nouveau mouvement
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Quantité</th>
                <th>Motif</th>
                <th>Utilisateur</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{m.date_mouvement}</td>
                  <td>
                    <span className={`badge ${m.type_code === "IN" ? "badge-in" : "badge-out"}`}>
                      {m.type_code === "IN" ? "Entrée" : "Sortie"}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>
                    {m.type_code === "IN" ? "+" : "-"}
                    {m.quantite}
                  </td>
                  <td>{m.motif}</td>
                  <td>{m.user_nom}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <h3>Aucun mouvement</h3>
                      <p>Cet article n'a pas encore de mouvement enregistré.</p>
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
