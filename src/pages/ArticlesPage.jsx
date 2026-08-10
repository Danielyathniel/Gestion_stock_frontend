import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RefTag from "../components/RefTag";
import StockBar from "../components/StockBar";
import StockBadge from "../components/StockBadge";
import { useToast } from "../context/ToastContext";
import * as articlesApi from "../api/articlesApi";
import * as categoriesApi from "../api/categoriesApi";

function formatMoney(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " F";
}

export default function ArticlesPage() {
  const { notify } = useToast();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [items, cats] = await Promise.all([
        articlesApi.listArticles({ search, categorieId, stock: stockFilter }),
        categoriesApi.listCategories(),
      ]);
      setArticles(items);
      setCategories(cats);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categorieId, stockFilter]);

  const counts = useMemo(
    () => ({
      rupture: articles.filter((a) => a.statut_stock === "rupture").length,
      faible: articles.filter((a) => a.statut_stock === "faible").length,
    }),
    [articles]
  );

  async function handleDelete() {
    try {
      await articlesApi.deleteArticle(toDelete.id);
      notify("Article supprimé.", "success");
      setToDelete(null);
      load();
    } catch (err) {
      notify(err.message, "error");
      setToDelete(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Articles</h2>
          <p>
            {articles.length} article(s) · {counts.rupture} en rupture · {counts.faible} en stock faible
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          + Ajouter un article
        </button>
      </div>

      <div className="filters-row">
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Rechercher par nom ou référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={categorieId} onChange={(e) => setCategorieId(e.target.value)}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>

        <div className="pill-tabs">
          <button className={`pill-tab ${stockFilter === "" ? "active" : ""}`} onClick={() => setStockFilter("")}>
            Tous
          </button>
          <button
            className={`pill-tab ${stockFilter === "faible" ? "active" : ""}`}
            onClick={() => setStockFilter("faible")}
          >
            Stock faible
          </button>
          <button
            className={`pill-tab ${stockFilter === "rupture" ? "active" : ""}`}
            onClick={() => setStockFilter("rupture")}
          >
            Rupture
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Article</th>
                <th>Catégorie</th>
                <th>Prix vente</th>
                <th>Stock</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--color-ink-soft)" }}>
                    Chargement...
                  </td>
                </tr>
              )}
              {!loading &&
                articles.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <RefTag>{a.reference}</RefTag>
                    </td>
                    <td>
                      <Link to={`/articles/${a.id}`} style={{ fontWeight: 600, textDecoration: "none" }}>
                        {a.nom}
                      </Link>
                    </td>
                    <td>{a.categorie_nom}</td>
                    <td>{formatMoney(a.prix_vente)}</td>
                    <td>
                      <StockBar actuel={a.stock_actuel} minimum={a.stock_minimum} statut={a.statut_stock} />
                    </td>
                    <td>
                      <StockBadge statut={a.statut_stock} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link className="btn btn-ghost btn-sm" to={`/articles/${a.id}`}>
                          Voir
                        </Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(a)}>
                          Modifier
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setToDelete(a)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && articles.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <h3>Aucun article trouvé</h3>
                      <p>Ajustez vos filtres ou ajoutez un nouvel article.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ArticleFormModal
          article={editing.id ? editing : null}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer l'article"
          message={`Voulez-vous vraiment supprimer "${toDelete.nom}" (${toDelete.reference}) ?`}
          confirmLabel="Supprimer"
          danger
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

function ArticleFormModal({ article, categories, onClose, onSaved }) {
  const { notify } = useToast();
  const [form, setForm] = useState({
    reference: article?.reference || "",
    nom: article?.nom || "",
    description: article?.description || "",
    categorie_id: article?.categorie_id || categories[0]?.id || "",
    prix_achat: article?.prix_achat ?? "",
    prix_vente: article?.prix_vente ?? "",
    stock_actuel: article?.stock_actuel ?? 0,
    stock_minimum: article?.stock_minimum ?? 5,
    unite: article?.unite || "Unité",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (article) {
        await articlesApi.updateArticle(article.id, form);
        notify("Article modifié.", "success");
      } else {
        await articlesApi.createArticle(form);
        notify("Article créé.", "success");
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={article ? "Modifier l'article" : "Nouvel article"} onClose={onClose} width="560px">
      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label>Référence</label>
            <input value={form.reference} onChange={(e) => set("reference", e.target.value)} placeholder="ART-006" required />
          </div>
          <div className="field">
            <label>Nom</label>
            <input value={form.nom} onChange={(e) => set("nom", e.target.value)} required />
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Catégorie</label>
            <select value={form.categorie_id} onChange={(e) => set("categorie_id", e.target.value)} required>
              <option value="">Sélectionner...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Unité</label>
            <input value={form.unite} onChange={(e) => set("unite", e.target.value)} placeholder="Unité, Carton, Kg..." />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Prix d'achat</label>
            <input type="number" min="0" value={form.prix_achat} onChange={(e) => set("prix_achat", e.target.value)} required />
          </div>
          <div className="field">
            <label>Prix de vente</label>
            <input type="number" min="0" value={form.prix_vente} onChange={(e) => set("prix_vente", e.target.value)} required />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Stock actuel {article && "(via mouvements)"}</label>
            <input type="number" min="0" value={form.stock_actuel} disabled={!!article} onChange={(e) => set("stock_actuel", e.target.value)} />
          </div>
          <div className="field">
            <label>Stock minimum (seuil d'alerte)</label>
            <input type="number" min="0" value={form.stock_minimum} onChange={(e) => set("stock_minimum", e.target.value)} required />
          </div>
        </div>

        {article && (
          <p style={{ fontSize: 12.5, color: "var(--color-ink-soft)", marginTop: -6 }}>
            Le stock actuel se met à jour uniquement via les entrées / sorties de stock.
          </p>
        )}

        {error && <p className="field-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
