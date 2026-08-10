import { useEffect, useMemo, useState } from "react";
import RefTag from "../components/RefTag";
import StockBadge from "../components/StockBadge";
import { useToast } from "../context/ToastContext";
import * as articlesApi from "../api/articlesApi";
import * as categoriesApi from "../api/categoriesApi";

function formatMoney(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " F";
}

export default function ReportsPage() {
  const { notify } = useToast();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([articlesApi.listArticles(), categoriesApi.listCategories()])
      .then(([a, c]) => {
        setArticles(a);
        setCategories(c);
      })
      .catch((err) => notify(err.message, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    return categories.map((c) => ({
      ...c,
      items: articles.filter((a) => a.categorie_id === c.id),
      valeur: articles
        .filter((a) => a.categorie_id === c.id)
        .reduce((s, a) => s + a.stock_actuel * a.prix_achat, 0),
    }));
  }, [categories, articles]);

  const valeurTotale = articles.reduce((s, a) => s + a.stock_actuel * a.prix_achat, 0);

  if (loading) return <p style={{ color: "var(--color-ink-soft)" }}>Chargement...</p>;

  return (
    <div>
      <div className="page-header no-print">
        <div>
          <h2>Rapports</h2>
          <p>Rapport des catégories et des articles disponibles, prêt à imprimer en PDF.</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨 Imprimer / Exporter en PDF
        </button>
      </div>

      <div className="card print-area" style={{ padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 20 }}>Rapport des catégories et articles</h2>
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", marginTop: 4 }}>
              Généré le {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12.5, color: "var(--color-ink-soft)" }}>Valeur totale du stock</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}>
              {formatMoney(valeurTotale)}
            </div>
          </div>
        </div>

        {grouped.map((cat) => (
          <div key={cat.id} style={{ marginBottom: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "2px solid var(--color-ink)",
                marginBottom: 6,
              }}
            >
              <h3 style={{ fontSize: 15 }}>{cat.nom}</h3>
              <span style={{ fontSize: 13, color: "var(--color-ink-soft)" }}>
                {cat.items.length} article(s) · {formatMoney(cat.valeur)}
              </span>
            </div>
            {cat.items.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--color-ink-soft)", padding: "8px 0" }}>Aucun article dans cette catégorie.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Article</th>
                    <th>Unité</th>
                    <th>Prix achat</th>
                    <th>Prix vente</th>
                    <th>Stock</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <RefTag>{a.reference}</RefTag>
                      </td>
                      <td>{a.nom}</td>
                      <td>{a.unite}</td>
                      <td>{formatMoney(a.prix_achat)}</td>
                      <td>{formatMoney(a.prix_vente)}</td>
                      <td>{a.stock_actuel}</td>
                      <td>
                        <StockBadge statut={a.statut_stock} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
