import { useEffect, useMemo, useRef, useState } from "react";
import "./ArticlesPage.css";
import {
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  fetchNextReference,
} from "../services/articleService";
import { fetchCategories } from "../services/categorieService";
import api from "../services/api";
import { exportToExcel } from "../services/export/exportService";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Printer,
  FileText,
  FileSpreadsheet,
  X,
  ChevronDown,
} from "lucide-react";

const UNITES = ["unité", "boîte", "paquet", "carton", "kg", "litre"];
const EXIT_DURATION = 220;

function emptyForm(categoriesList) {
  return {
    reference: "",
    nom: "",
    description: "",
    categorieId: categoriesList[0]?.id ? String(categoriesList[0].id) : "",
    prixAchat: "0",
    prixVente: "0",
    stock: "0",
    stockMin: "0",
    unite: UNITES[0],
  };
}

function getStockStatus(article) {
  const stock = Number(article.stock);
  const stockMin = Number(article.stockMin);
  if (stock <= 0) return "rupture";
  if (stock <= stockMin) return "faible";
  return "ok";
}

function formatMontant(value) {
  return new Intl.NumberFormat("fr-FR").format(Number(value) || 0) + " FCFA";
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
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const printMenuRef = useRef(null);

  useEffect(() => {
    loadAll();
  }, []);

  // Gestion des clics extérieurs pour fermer le menu d'actions et le menu d'impression
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
      if (printMenuRef.current && !printMenuRef.current.contains(e.target)) {
        setShowPrintMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      setLoadError("Impossible de charger les articles.");
    } finally {
      setLoading(false);
    }
  }

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((art) => {
      const matchesSearch =
        !query ||
        art.nom?.toLowerCase().includes(query) ||
        art.reference?.toLowerCase().includes(query);
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

  async function openAddModal() {
    const initialForm = emptyForm(categoriesList);
    setForm(initialForm);
    setFormError("");
    setModal({ mode: "add" });
    try {
      const reference = await fetchNextReference();
      setForm((prev) => ({ ...prev, reference }));
    } catch {
      setFormError("Impossible de générer la référence.");
    }
  }

  function showSuccess(message) {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(""), 3000);
  }

  function openEditModal(article) {
    setForm({
      reference: article.reference || "",
      nom: article.nom || "",
      description: article.description || "",
      categorieId: String(article.categorieId ?? categoriesList[0]?.id ?? ""),
      prixAchat: String(article.prixAchat ?? 0),
      prixVente: String(article.prixVente ?? 0),
      stock: String(article.stock ?? 0),
      stockMin: String(article.stockMin ?? 0),
      unite: article.unite || UNITES[0],
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
      !form.nom.trim() ||
      !form.description.trim() ||
      !form.categorieId ||
      form.stock === "" ||
      form.stockMin === ""
    ) {
      setFormError("Tous les champs obligatoires doivent être renseignés.");
      return;
    }

    setSaving(true);
    setFormError("");

    const payload = {
      ...form,
      categorieId: Number(form.categorieId),
      prixAchat: Number(form.prixAchat) || 0,
      prixVente: Number(form.prixVente) || 0,
      stock: Number(form.stock) || 0,
      stockMin: Number(form.stockMin) || 0,
    };

    try {
      if (modal.mode === "add") {
        const created = await createArticle(payload);
        setArticles((prev) => [...prev, created]);
        showSuccess("Article ajouté avec succès.");
      } else {
        const updated = await updateArticle(modal.article.id, payload);
        setArticles((prev) =>
          prev.map((art) => (art.id === updated.id ? updated : art))
        );
        showSuccess("Modification enregistrée.");
      }
      closeModal();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const firstError = apiErrors ? Object.values(apiErrors)[0]?.[0] : null;
      setFormError(
        firstError || err.response?.data?.message || "Une erreur est survenue."
      );
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
    closeDeleteModal();

    try {
      await deleteArticle(target.id);
      setRemovingId(target.id);
      window.setTimeout(() => {
        setArticles((prev) => prev.filter((art) => art.id !== target.id));
        setRemovingId(null);
        showSuccess("Article supprimé avec succès.");
      }, EXIT_DURATION);
    } catch (err) {
      setFormError("Impossible de supprimer cet article.");
    }
  }

  async function handleDownloadPDF() {
    setShowPrintMenu(false);
    setIsGenerating(true);
    try {
      const response = await api.get("/articles/export/pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;

      const disposition = response.headers["content-disposition"];
      const filename = disposition
        ? disposition.split("filename=")[1]?.replace(/"/g, "")
        : `RAPPORT_ARTICLES_${new Date().toISOString().split("T")[0]}.pdf`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
    } finally {
      setIsGenerating(false);
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
        <div className="articles-header">
          <div className="articles-header-left">
            <h1 className="page-title">Articles</h1>
            <p className="page-subtitle">Fiches produits et niveaux de stock.</p>
          </div>

          <div className="articles-header-right">
            <div className="print-menu-container" ref={printMenuRef}>
              <button
                type="button"
                className="btn btn-print-small"
                onClick={() => setShowPrintMenu(!showPrintMenu)}
                disabled={loading || articles.length === 0}
              >
                <Printer size={16} />
                Imprimer
                <ChevronDown
                  size={14}
                  className={`print-chevron ${showPrintMenu ? "rotated" : ""}`}
                />
              </button>

              {showPrintMenu && (
                <div className="print-menu-dropdown">
                  <div className="print-menu-header">
                    <span>Exporter</span>
                    <button
                      type="button"
                      className="print-menu-close"
                      onClick={() => setShowPrintMenu(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="print-menu-options">
                    <button
                      type="button"
                      className="print-option"
                      onClick={handleDownloadPDF}
                    >
                      <FileText size={16} />
                      <span>{isGenerating ? "Génération..." : "PDF"}</span>
                    </button>

                    <button
                      type="button"
                      className="print-option"
                      onClick={() => {
                        setShowPrintMenu(false);
                        setIsGenerating(true);
                        try {
                          exportToExcel(articles, "STOCKFLOW");
                        } catch (error) {
                          console.error("Erreur export Excel:", error);
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                    >
                      <FileSpreadsheet size={16} />
                      <span>{isGenerating ? "Génération..." : "Excel"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {successMessage && <p className="modal-success">{successMessage}</p>}

        {alertCount > 0 && (
          <div className="stock-alert-banner">
            <span className="stock-alert-dot" aria-hidden="true" />
            {alertCount} article{alertCount > 1 ? "s" : ""} en stock faible
          </div>
        )}

        <div className="articles-toolbar">
          <div className="articles-search">
            <span className="articles-search-icon" aria-hidden="true">
              ⌕
            </span>
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

          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
          >
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
                <th className="col-num">Stock Actuel</th>
                <th className="col-num">Stock min</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="articles-empty">
                    {search ||
                    categoryFilter !== "Toutes" ||
                    stockFilter !== "Tous"
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
                      className={`row-enter${
                        art.id === removingId ? " row-exit" : ""
                      }`}
                      style={{
                        animationDelay: `${Math.min(index, 8) * 30}ms`,
                      }}
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
                        <div
                          className="action-menu-wrapper"
                          ref={openMenuId === art.id ? menuRef : null}
                        >
                          <button
                            type="button"
                            className="action-menu-trigger"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === art.id ? null : art.id
                              )
                            }
                            aria-label="Actions"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {openMenuId === art.id && (
                            <div className="action-menu-dropdown">
                              <button
                                type="button"
                                className="action-menu-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setViewTarget(art);
                                }}
                              >
                                <Eye size={15} />
                                Voir
                              </button>
                              <button
                                type="button"
                                className="action-menu-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openEditModal(art);
                                }}
                              >
                                <Pencil size={15} />
                                Modifier
                              </button>
                              <button
                                type="button"
                                className="action-menu-item action-menu-item--danger"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeleteTarget(art);
                                }}
                              >
                                <Trash2 size={15} />
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE AJOUT / MODIFICATION */}
      {modal && (
        <div
          className={`modal-overlay${modal.closing ? " is-closing" : ""}`}
          onClick={closeModal}
        >
          <div
            className={`modal-box modal-box-wide${
              modal.closing ? " is-closing" : ""
            }`}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">
              {modal.mode === "add"
                ? "Ajouter un article"
                : "Modifier l'article"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label className="modal-label">
                    Référence / Code article
                    <span className="required-mark" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    className="modal-input"
                    value={form.reference}
                    disabled
                    readOnly
                  />
                </div>
                <div className="form-field">
                  <label className="modal-label">
                    Nom
                    <span className="required-mark" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  </label>
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
                  <label className="modal-label">
                    Description
                    <span className="required-mark" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  </label>
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
                  <label className="modal-label">
                    Catégorie
                    <span className="required-mark" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  </label>
                  <select
                    className="modal-input"
                    value={form.categorieId}
                    onChange={(e) => updateField("categorieId", e.target.value)}
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
                  <label className="modal-label">
                    Unité
                    <span className="required-mark" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  </label>
                  <select
                    className="modal-input"
                    value={form.unite}
                    onChange={(e) => updateField("unite", e.target.value)}
                    disabled={saving}
                    required
                  >
                    {UNITES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
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
                  <label className="modal-label">
                    Stock actuel
                    <span className="required-mark" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  </label>
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
                  <label className="modal-label">
                    Stock minimum
                    <span className="required-mark" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  </label>
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
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "…"
                    : modal.mode === "add"
                    ? "Ajouter"
                    : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE VISUALISATION */}
      {viewTarget && (
        <div
          className={`modal-overlay${viewTarget.closing ? " is-closing" : ""}`}
          onClick={closeViewModal}
        >
          <div
            className={`modal-box modal-box-wide${
              viewTarget.closing ? " is-closing" : ""
            }`}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="view-header">
              <h2 className="modal-title">{viewTarget.nom}</h2>
              <span
                className={`stock-badge stock-badge-${getStockStatus(
                  viewTarget
                )}`}
              >
                {getStockStatus(viewTarget) === "rupture" && "Rupture"}
                {getStockStatus(viewTarget) === "faible" && "Stock faible"}
                {getStockStatus(viewTarget) === "ok" && "En stock"}
              </span>
            </div>
            <dl className="view-grid">
              <div className="view-item">
                <dt>Référence</dt>
                <dd>{viewTarget.reference}</dd>
              </div>
              <div className="view-item">
                <dt>Catégorie</dt>
                <dd>{viewTarget.categorie}</dd>
              </div>
              <div className="view-item view-item-full">
                <dt>Description</dt>
                <dd>{viewTarget.description || "—"}</dd>
              </div>
              <div className="view-item">
                <dt>Prix d'achat</dt>
                <dd>{formatMontant(viewTarget.prixAchat)}</dd>
              </div>
              <div className="view-item">
                <dt>Prix de vente</dt>
                <dd>{formatMontant(viewTarget.prixVente)}</dd>
              </div>
              <div className="view-item">
                <dt>Stock actuel</dt>
                <dd>
                  {viewTarget.stock} {viewTarget.unite}
                </dd>
              </div>
              <div className="view-item">
                <dt>Stock minimum</dt>
                <dd>
                  {viewTarget.stockMin} {viewTarget.unite}
                </dd>
              </div>
              <div className="view-item">
                <dt>Date de création</dt>
                <dd>{formatDate(viewTarget.dateCreation)}</dd>
              </div>
            </dl>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeViewModal}
              >
                Fermer
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  closeViewModal();
                  window.setTimeout(
                    () => openEditModal(viewTarget),
                    EXIT_DURATION
                  );
                }}
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE SUPPRESSION */}
      {deleteTarget && (
        <div
          className={`modal-overlay${
            deleteTarget.closing ? " is-closing" : ""
          }`}
          onClick={closeDeleteModal}
        >
          <div
            className={`modal-box${deleteTarget.closing ? " is-closing" : ""}`}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Supprimer l'article ?</h2>
            <p className="modal-text">
              Êtes-vous sûr de vouloir supprimer l'article{" "}
              <strong>{deleteTarget.nom}</strong> ({deleteTarget.reference}) ?
              Cette action est irréversible.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeDeleteModal}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}