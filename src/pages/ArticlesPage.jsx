import { useEffect, useMemo, useState } from "react";
import "./ArticlesPage.css";
import {
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../services/articleService";
import { fetchCategories } from "../services/categorieService";

const UNITES = ["unité", "boîte", "paquet", "carton", "kg", "litre"];
const EXIT_DURATION = 220;

function emptyForm(categoriesList) {
  return {
    reference: "",
    nom: "",
    description: "",
    categorieId: categoriesList[0]?.id ?? "",
    prixAchat: "",
    prixVente: "",
    stock: "",
    stockMin: "",
    unite: UNITES[0],
  };
}

function getStockStatus(article) {
  if (article.stock <= 0) return "rupture";
  if (article.stock <= article.stockMin) return "faible";
  return "ok";
}

function formatMontant(value) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [stockFilter, setStockFilter] = useState("Tous");

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm([]));
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setLoadError("");
    try {
      const [articlesData, categoriesData] = await Promise.all([
        fetchArticles(),
        fetchCategories(),
      ]);
      setArticles(articlesData);
      setCategoriesList(categoriesData);
    } catch (err) {
      setLoadError("Impossible de charger les articles. Vérifie que l'API tourne bien.");
    } finally {
      setLoading(false);
    }
  }

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((art) => {
      const matchesSearch =
        !query ||
        art.nom.toLowerCase().includes(query) ||
        art.reference.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "Toutes" || art.categorie === categoryFilter;
      const status = getStockStatus(art);
      const matchesStock =
        stockFilter === "Tous" ||
        (stockFilter === "Rupture" && status === "rupture") ||
        (stockFilter === "Faible" && status === "faible");
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [articles, search, categoryFilter, stockFilter]);

  const alertCount = useMemo(
    () => articles.filter((a) => getStockStatus(a) !== "ok").length,
    [articles]
  );

  function openAddModal() {
    setForm(emptyForm(categoriesList));
    setFormError("");
    setModal({ mode: "add" });
  }

  function showSuccess(message) {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(""), 3000);
  }

  function openEditModal(article) {
    setForm({
      reference: article.reference,
      nom: article.nom,
      description: article.description,
      categorieId: article.categorieId,
      prixAchat: String(article.prixAchat),
      prixVente: String(article.prixVente),
      stock: String(article.stock),
      stockMin: String(article.stockMin),
      unite: article.unite,
    });
    setFormError("");
    setModal({ mode: "edit", article });
  }

  function closeModal() {
    setModal((prev) => (prev ? { ...prev, closing: true } : prev));
    window.setTimeout(() => {
      setModal(null);
      setForm(emptyForm(categoriesList));
      setFormError("");
    }, EXIT_DURATION);
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.reference.trim() ||
      !form.nom.trim() ||
      !form.description.trim() ||
      !form.categorieId ||
      form.stock === "" ||
      form.stockMin === ""
    ) {
      setFormError("Tous les champs sont obligatoires, sauf les prix.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (modal.mode === "add") {
        const created = await createArticle(form);
        setArticles((prev) => [...prev, created]);
        showSuccess("Article ajouté avec succès.");
      } else {
        const updated = await updateArticle(modal.article.id, form);
        setArticles((prev) =>
          prev.map((art) => (art.id === updated.id ? updated : art))
        );
        showSuccess("Modification enregistrée.");
      }
      closeModal();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const firstError = apiErrors ? Object.values(apiErrors)[0]?.[0] : null;
      setFormError(firstError || err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  function closeViewModal() {
    setViewTarget((prev) => (prev ? { ...prev, closing: true } : prev));
    window.setTimeout(() => setViewTarget(null), EXIT_DURATION);
  }

  function closeDeleteModal() {
    setDeleteTarget((prev) => (prev ? { ...prev, closing: true } : prev));
    window.setTimeout(() => setDeleteTarget(null), EXIT_DURATION);
  }

  async function confirmDelete() {
    const target = deleteTarget;
    setDeleteTarget((prev) => (prev ? { ...prev, closing: true } : prev));

    window.setTimeout(() => setDeleteTarget(null), EXIT_DURATION);

    try {
      await deleteArticle(target.id);
      setRemovingId(target.id);
      window.setTimeout(() => {
        setArticles((prev) => prev.filter((art) => art.id !== target.id));
        setRemovingId(null);
        showSuccess("Article supprimé avec succès.");
      }, EXIT_DURATION);
    } catch (err) {
      // si la suppression échoue côté API (ex: article lié à des mouvements),
      // on pourrait afficher err.response.data.message ici
    }
  }

  if (loading) {
    return (
      <div className="articles-page">
        <div className="articles-content">
          <h1 className="page-title">Articles</h1>
          <p className="page-subtitle">Chargement…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="articles-page">
        <div className="articles-content">
          <h1 className="page-title">Articles</h1>
          <p className="page-subtitle">{loadError}</p>
          <button type="button" className="btn btn-primary" onClick={loadAll}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="articles-page">
      <div className="articles-content">
        <h1 className="page-title">Articles</h1>
        <p className="page-subtitle">Fiches produits et niveaux de stock.</p>

      {successMessage && <p className="modal-success">{successMessage}</p>}

      {alertCount > 0 && (
        <div className="stock-alert-banner">
          <span className="stock-alert-dot" aria-hidden="true" />
          {alertCount} article{alertCount > 1 ? "s" : ""} en rupture ou en stock faible
        </div>
      )}

      <div className="articles-toolbar">
        <div className="articles-search">
          <span className="articles-search-icon" aria-hidden="true">⌕</span>
          <input
            type="text"
            placeholder="Rechercher par nom ou référence…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher un article"
          />
        </div>

        <select
          className="articles-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filtrer par catégorie"
        >
          <option value="Toutes">Toutes les catégories</option>
          {categoriesList.map((cat) => (
            <option key={cat.id} value={cat.nom}>
              {cat.nom}
            </option>
          ))}
        </select>

        <select
          className="articles-select"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          aria-label="Filtrer par niveau de stock"
        >
          <option value="Tous">Tous les stocks</option>
          <option value="Faible">Stock faible</option>
          <option value="Rupture">Rupture</option>
        </select>

        <button type="button" className="btn btn-primary" onClick={openAddModal}>
          + Ajouter un article
        </button>
      </div>

      <div className="articles-table-wrap">
        <table className="articles-table">
          <thead>
            <tr>
              <th className="col-ref">Référence</th>
              <th>Article</th>
              <th>Catégorie</th>
              <th className="col-num">Stock</th>
              <th className="col-num">Stock min.</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={6} className="articles-empty">
                  {search || categoryFilter !== "Toutes" || stockFilter !== "Tous"
                    ? "Aucun article ne correspond à ces critères."
                    : "Aucun article pour le moment. Ajoutes-en un pour commencer."}
                </td>
              </tr>
            ) : (
              filteredArticles.map((art, index) => {
                const status = getStockStatus(art);
                return (
                  <tr
                    key={art.id}
                    className={`row-enter${art.id === removingId ? " row-exit" : ""}`}
                    style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
                  >
                    <td className="col-ref">{art.reference}</td>
                    <td>
                      <button
                        type="button"
                        className="article-name-btn"
                        onClick={() => setViewTarget(art)}
                      >
                        {art.nom}
                      </button>
                    </td>
                    <td>{art.categorie}</td>
                    <td className="col-num">
                      <span className={`stock-badge stock-badge-${status}`}>
                        {art.stock}
                        {status === "rupture" && " · rupture"}
                        {status === "faible" && " · faible"}
                      </span>
                    </td>
                    <td className="col-num">{art.stockMin}</td>
                    <td className="col-actions">
                      <button type="button" className="link-action" onClick={() => setViewTarget(art)}>
                        Voir
                      </button>
                      <span className="action-sep">/</span>
                      <button type="button" className="link-action" onClick={() => openEditModal(art)}>
                        Modifier
                      </button>
                      <span className="action-sep">/</span>
                      <button
                        type="button"
                        className="link-action link-action-danger"
                        onClick={() => setDeleteTarget(art)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {modal && (
        <div className={`modal-overlay${modal.closing ? " is-closing" : ""}`} onClick={closeModal}>
          <div
            className={`modal-box modal-box-wide${modal.closing ? " is-closing" : ""}`}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">
              {modal.mode === "add" ? "Ajouter un article" : "Modifier l'article"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label className="modal-label">Référence / Code article<span className="required-mark" aria-hidden="true"> *</span></label>
                  <input
                    type="text"
                    className="modal-input"
                    value={form.reference}
                    onChange={(e) => updateField("reference", e.target.value)}
                    disabled={saving}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-field">
                  <label className="modal-label">Nom<span className="required-mark" aria-hidden="true"> *</span></label>
                  <input
                    type="text"
                    className="modal-input"
                    value={form.nom}
                    onChange={(e) => updateField("nom", e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="form-field form-field-full">
                  <label className="modal-label">Description<span className="required-mark" aria-hidden="true"> *</span></label>
                  <textarea
                    className="modal-input modal-textarea"
                    rows={2}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="modal-label">Catégorie<span className="required-mark" aria-hidden="true"> *</span></label>
                  <select
                    className="modal-input"
                    value={form.categorieId}
                    onChange={(e) => updateField("categorieId", Number(e.target.value))}
                    disabled={saving}
                    required
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="modal-label">Unité<span className="required-mark" aria-hidden="true"> *</span></label>
                  <select
                    className="modal-input"
                    value={form.unite}
                    onChange={(e) => updateField("unite", e.target.value)}
                    disabled={saving}
                    required
                  >
                    {UNITES.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="modal-label">Prix d'achat (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    className="modal-input"
                    value={form.prixAchat}
                    onChange={(e) => updateField("prixAchat", e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="form-field">
                  <label className="modal-label">Prix de vente (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    className="modal-input"
                    value={form.prixVente}
                    onChange={(e) => updateField("prixVente", e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="form-field">
                  <label className="modal-label">Stock actuel<span className="required-mark" aria-hidden="true"> *</span></label>
                  <input
                    type="number"
                    min="0"
                    className="modal-input"
                    value={form.stock}
                    onChange={(e) => updateField("stock", e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="modal-label">Stock minimum<span className="required-mark" aria-hidden="true"> *</span></label>
                  <input
                    type="number"
                    min="0"
                    className="modal-input"
                    value={form.stockMin}
                    onChange={(e) => updateField("stockMin", e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
              </div>

              {formError && <p className="modal-error">{formError}</p>}

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={saving}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "…" : modal.mode === "add" ? "Ajouter" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewTarget && (
        <div className={`modal-overlay${viewTarget.closing ? " is-closing" : ""}`} onClick={closeViewModal}>
          <div
            className={`modal-box modal-box-wide${viewTarget.closing ? " is-closing" : ""}`}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="view-header">
              <h2 className="modal-title">{viewTarget.nom}</h2>
              <span className={`stock-badge stock-badge-${getStockStatus(viewTarget)}`}>
                {getStockStatus(viewTarget) === "rupture" && "Rupture"}
                {getStockStatus(viewTarget) === "faible" && "Stock faible"}
                {getStockStatus(viewTarget) === "ok" && "En stock"}
              </span>
            </div>
            <dl className="view-grid">
              <div className="view-item"><dt>Référence</dt><dd>{viewTarget.reference}</dd></div>
              <div className="view-item"><dt>Catégorie</dt><dd>{viewTarget.categorie}</dd></div>
              <div className="view-item view-item-full"><dt>Description</dt><dd>{viewTarget.description || "—"}</dd></div>
              <div className="view-item"><dt>Prix d'achat</dt><dd>{formatMontant(viewTarget.prixAchat)}</dd></div>
              <div className="view-item"><dt>Prix de vente</dt><dd>{formatMontant(viewTarget.prixVente)}</dd></div>
              <div className="view-item"><dt>Stock actuel</dt><dd>{viewTarget.stock} {viewTarget.unite}</dd></div>
              <div className="view-item"><dt>Stock minimum</dt><dd>{viewTarget.stockMin} {viewTarget.unite}</dd></div>
              <div className="view-item"><dt>Date de création</dt><dd>{formatDate(viewTarget.dateCreation)}</dd></div>
            </dl>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={closeViewModal}>Fermer</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  closeViewModal();
                  window.setTimeout(() => openEditModal(viewTarget), EXIT_DURATION);
                }}
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className={`modal-overlay${deleteTarget.closing ? " is-closing" : ""}`} onClick={closeDeleteModal}>
          <div
            className={`modal-box${deleteTarget.closing ? " is-closing" : ""}`}
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Supprimer « {deleteTarget.nom} » ?</h2>
            <p className="modal-text">
              Cette action est définitive et retirera cet article de ton inventaire.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={closeDeleteModal}>Annuler</button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}