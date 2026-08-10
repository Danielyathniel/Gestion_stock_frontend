import { useEffect, useState } from "react";
import RefTag from "../components/RefTag";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as articlesApi from "../api/articlesApi";
import * as movementsApi from "../api/movementsApi";

const today = () => new Date().toISOString().slice(0, 10);

export default function MovementsPage() {
  const { user } = useAuth();
  const { notify } = useToast();

  const [articles, setArticles] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("IN");
  const [articleId, setArticleId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [date, setDate] = useState(today());
  const [motif, setMotif] = useState("");
  const [observation, setObservation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [filterType, setFilterType] = useState("");
  const [filterArticle, setFilterArticle] = useState("");

  const selectedArticle = articles.find((a) => String(a.id) === String(articleId));

  async function loadArticles() {
    setArticles(await articlesApi.listArticles());
  }

  async function loadMovements() {
    setMovements(await movementsApi.listMovements({ type: filterType, articleId: filterArticle }));
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadArticles(), loadMovements()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterArticle]);

  function resetForm() {
    setArticleId("");
    setQuantite("");
    setDate(today());
    setMotif("");
    setObservation("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { newStock } = await movementsApi.registerMovement(user.id, {
        type,
        article_id: articleId,
        quantite,
        date_mouvement: date,
        motif,
        observation,
      });
      notify(
        `${type === "IN" ? "Entrée" : "Sortie"} enregistrée. Nouveau stock : ${newStock}.`,
        "success"
      );
      resetForm();
      await Promise.all([loadArticles(), loadMovements()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Mouvements de stock</h2>
          <p>Enregistrez une entrée ou une sortie, et consultez l'historique complet.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>
        <div className="card card-pad">
          <h2 style={{ fontSize: 16, marginBottom: 14 }}>Nouveau mouvement</h2>

          <div className="pill-tabs" style={{ marginBottom: 16 }}>
            <button type="button" className={`pill-tab ${type === "IN" ? "active" : ""}`} onClick={() => setType("IN")}>
              ↓ Entrée
            </button>
            <button type="button" className={`pill-tab ${type === "OUT" ? "active" : ""}`} onClick={() => setType("OUT")}>
              ↑ Sortie
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Article</label>
              <select value={articleId} onChange={(e) => setArticleId(e.target.value)} required>
                <option value="">Sélectionner un article...</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.reference} — {a.nom} (stock : {a.stock_actuel})
                  </option>
                ))}
              </select>
            </div>

            {selectedArticle && type === "OUT" && (
              <p style={{ fontSize: 12.5, color: "var(--color-ink-soft)", marginTop: -10, marginBottom: 14 }}>
                Stock disponible : <strong>{selectedArticle.stock_actuel}</strong> {selectedArticle.unite}
              </p>
            )}

            <div className="field-row">
              <div className="field">
                <label>Quantité</label>
                <input type="number" min="1" value={quantite} onChange={(e) => setQuantite(e.target.value)} required />
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            </div>

            <div className="field">
              <label>Motif</label>
              <input
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder={type === "IN" ? "ex : Achat fournisseur" : "ex : Vente client"}
                required
              />
            </div>

            <div className="field">
              <label>Observation (facultatif)</label>
              <textarea rows={2} value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="N° BL, client, remarque..." />
            </div>

            {error && <p className="field-error">{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: "100%", justifyContent: "center" }}>
              {submitting ? "Enregistrement..." : `Enregistrer ${type === "IN" ? "l'entrée" : "la sortie"}`}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Historique</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <select value={filterArticle} onChange={(e) => setFilterArticle(e.target.value)}>
                <option value="">Tous les articles</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.reference} — {a.nom}
                  </option>
                ))}
              </select>
              <div className="pill-tabs">
                <button className={`pill-tab ${filterType === "" ? "active" : ""}`} onClick={() => setFilterType("")}>
                  Tous
                </button>
                <button className={`pill-tab ${filterType === "IN" ? "active" : ""}`} onClick={() => setFilterType("IN")}>
                  Entrées
                </button>
                <button className={`pill-tab ${filterType === "OUT" ? "active" : ""}`} onClick={() => setFilterType("OUT")}>
                  Sorties
                </button>
              </div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Article</th>
                  <th>Type</th>
                  <th>Quantité</th>
                  <th>Motif</th>
                  <th>Utilisateur</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--color-ink-soft)" }}>
                      Chargement...
                    </td>
                  </tr>
                )}
                {!loading &&
                  movements.map((m) => (
                    <tr key={m.id}>
                      <td>{m.date_mouvement}</td>
                      <td>
                        <RefTag>{m.article_reference}</RefTag> {m.article_nom}
                      </td>
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
                {!loading && movements.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <h3>Aucun mouvement</h3>
                        <p>Ajustez vos filtres ou enregistrez un nouveau mouvement.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
