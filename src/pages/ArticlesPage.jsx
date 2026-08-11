import { useMemo, useState } from "react";
import "./ArticlesPage.css";

// À terme, cette liste viendra de l'API /api/categories (partagée avec CategoriesPage)
const categoriesList = ["Informatique", "Fournitures", "Nettoyage"];

const UNITES = ["unité", "boîte", "paquet", "carton", "kg", "litre"];

const initialArticles = [
  {
    id: 1,
    reference: "ART-001",
    nom: "Souris Logitech",
    description: "Souris optique sans fil, USB.",
    categorie: "Informatique",
    prixAchat: 8000,
    prixVente: 12000,
    stock: 25,
    stockMin: 10,
    unite: "unité",
    dateCreation: "2026-01-14",
  },
  {
    id: 2,
    reference: "ART-002",
    nom: "Clavier HP",
    description: "Clavier filaire AZERTY.",
    categorie: "Informatique",
    prixAchat: 10000,
    prixVente: 15000,
    stock: 0,
    stockMin: 5,
    unite: "unité",
    dateCreation: "2026-01-20",
  },
  {
    id: 3,
    reference: "ART-003",
    nom: "Papier A4",
    description: "Ramette de 500 feuilles, 80g.",
    categorie: "Fournitures",
    prixAchat: 2500,
    prixVente: 3500,
    stock: 8,
    stockMin: 20,
    unite: "carton",
    dateCreation: "2026-02-02",
  },
];

const EXIT_DURATION = 220;

const emptyForm = {
  reference: "",
  nom: "",
  description: "",
  categorie: categoriesList[0] ?? "",
  prixAchat: "",
  prixVente: "",
  stock: "",
  stockMin: "",
  unite: UNITES[0],
};

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
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [stockFilter, setStockFilter] = useState("Tous");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [removingId, setRemovingId] = useState(null);

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
    setForm(emptyForm);
    setFormError("");
    setModal({ mode: "add" });
  }

  function openEditModal(article) {
    setForm({
      reference: article.reference,
      nom: article.nom,
      description: article.description,
      categorie: article.categorie,
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
      setForm(emptyForm);
      setFormError("");
    }, EXIT_DURATION);
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const reference = form.reference.trim();
    const nom = form.nom.trim();

    if (!reference || !nom || !form.categorie) {
      setFormError("Référence, nom et catégorie sont obligatoires.");
      return;
    }

    const prixAchat = Number(form.prixAchat);
    const prixVente = Number(form.prixVente);
    const stock = Number(form.stock);
    const stockMin = Number(form.stockMin);

    if ([prixAchat, prixVente, stock, stockMin].some((n) => Number.isNaN(n) || n < 0)) {
      setFormError("Les prix et les quantités doivent être des nombres positifs.");
      return;
    }

    const isDuplicateRef = articles.some(
      (art) =>
        art.reference.toLowerCase() === reference.toLowerCase() &&
        !(modal.mode === "edit" && art.id === modal.article.id)
    );
    if (isDuplicateRef) {
      setFormError("Cette référence existe déjà.");
      return;
    }

    if (modal.mode === "add") {
      const nextId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1;
      setArticles((prev) => [
        ...prev,
        {
          id: nextId,
          reference,
          nom,
          description: form.description.trim(),
          categorie: form.categorie,
          prixAchat,
          prixVente,
          stock,
          stockMin,
          unite: form.unite,
          dateCreation: new Date().toISOString().slice(0, 10),
        },
      ]);
    } else {
      setArticles((prev) =>
        prev.map((art) =>
          art.id === modal.article.id
            ? {
                ...art,
                reference,
                nom,
                description: form.description.trim(),
                categorie: form.categorie,
                prixAchat,
                prixVente,
                stock,
                stockMin,
                unite: form.unite,
              }
            : art
        )
      );
    }

    closeModal();
  }

  function closeViewModal() {
    setViewTarget((prev) => (prev ? { ...prev, closing: true } : prev));
    window.setTimeout(() => setViewTarget(null), EXIT_DURATION);
  }

  function closeDeleteModal() {
    setDeleteTarget((prev) => (prev ? { ...prev, closing: true } : prev));
    window.setTimeout(() => setDeleteTarget(null), EXIT_DURATION);
  }

  function confirmDelete() {
    const target = deleteTarget;
    setDeleteTarget((prev) => (prev ? { ...prev, closing: true } : prev));

    window.setTimeout(() => {
      setDeleteTarget(null);
      setRemovingId(target.id);
    }, EXIT_DURATION);

    window.setTimeout(() => {
      setArticles((prev) => prev.filter((art) => art.id !== target.id));
      setRemovingId(null);
    }, EXIT_DURATION * 2);
  }

  return (
    <div className="articles-page">
      <h1 className="page-title">Articles</h1>
      <p className="page-subtitle">Fiches produits et niveaux de stock.</p>

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
            <option key={cat} value={cat}>
              {cat}
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
                        title="Voir les détails"
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
                      <button
                        type="button"
                        className="link-action"
                        onClick={() => setViewTarget(art)}
                      >
                        Voir
                      </button>
                      <span className="action-sep">/</span>
                      <button
                        type="button"
                        className="link-action"
                        onClick={() => openEditModal(art)}
                      >
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

      {modal && (
        <div
          className={`modal-overlay${modal.closing ? " is-closing" : ""}`}
          onClick={closeModal}
        >
          <div
            className={`modal-box modal-box-wide${modal.closing ? " is-closing" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="article-modal-title" className="modal-title">
              {modal.mode === "add" ? "Ajouter un article" : "Modifier l'article"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label className="modal-label" htmlFor="art-reference">
                    Référence / Code article
                  </label>
                  <input
                    id="art-reference"
                    type="text"
                    className="modal-input"
                    placeholder="Ex : ART-004"
                    value={form.reference}
                    onChange={(e) => updateField("reference", e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-field">
                  <label className="modal-label" htmlFor="art-nom">
                    Nom
                  </label>
                  <input
                    id="art-nom"
                    type="text"
                    className="modal-input"
                    placeholder="Ex : Souris Logitech"
                    value={form.nom}
                    onChange={(e) => updateField("nom", e.target.value)}
                  />
                </div>

                <div className="form-field form-field-full">
                  <label className="modal-label" htmlFor="art-description">
                    Description
                  </label>
                  <textarea
                    id="art-description"
                    className="modal-input modal-textarea"
                    placeholder="Détails, spécifications…"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="form-field">
                  <label className="modal-label" htmlFor="art-categorie">
                    Catégorie
                  </label>
                  <select
                    id="art-categorie"
                    className="modal-input"
                    value={form.categorie}
                    onChange={(e) => updateField("categorie", e.target.value)}
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="modal-label" htmlFor="art-unite">
                    Unité
                  </label>
                  <select
                    id="art-unite"
                    className="modal-input"
                    value={form.unite}
                    onChange={(e) => updateField("unite", e.target.value)}
                  >
                    {UNITES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="modal-label" htmlFor="art-prix-achat">
                    Prix d'achat (FCFA)
                  </label>
                  <input
                    id="art-prix-achat"
                    type="number"
                    min="0"
                    className="modal-input"
                    value={form.prixAchat}
                    onChange={(e) => updateField("prixAchat", e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="modal-label" htmlFor="art-prix-vente">
                    Prix de vente (FCFA)
                  </label>
                  <input
                    id="art-prix-vente"
                    type="number"
                    min="0"
                    className="modal-input"
                    value={form.prixVente}
                    onChange={(e) => updateField("prixVente", e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="modal-label" htmlFor="art-stock">
                    Stock actuel
                  </label>
                  <input
                    id="art-stock"
                    type="number"
                    min="0"
                    className="modal-input"
                    value={form.stock}
                    onChange={(e) => updateField("stock", e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="modal-label" htmlFor="art-stock-min">
                    Stock minimum
                  </label>
                  <input
                    id="art-stock-min"
                    type="number"
                    min="0"
                    className="modal-input"
                    value={form.stockMin}
                    onChange={(e) => updateField("stockMin", e.target.value)}
                  />
                </div>
              </div>

              {formError && <p className="modal-error">{formError}</p>}

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {modal.mode === "add" ? "Ajouter" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewTarget && (
        <div
          className={`modal-overlay${viewTarget.closing ? " is-closing" : ""}`}
          onClick={closeViewModal}
        >
          <div
            className={`modal-box modal-box-wide${viewTarget.closing ? " is-closing" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="view-header">
              <h2 id="view-modal-title" className="modal-title">
                {viewTarget.nom}
              </h2>
              <span className={`stock-badge stock-badge-${getStockStatus(viewTarget)}`}>
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
              <button type="button" className="btn btn-ghost" onClick={closeViewModal}>
                Fermer
              </button>
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
        <div
          className={`modal-overlay${deleteTarget.closing ? " is-closing" : ""}`}
          onClick={closeDeleteModal}
        >
          <div
            className={`modal-box${deleteTarget.closing ? " is-closing" : ""}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-modal-title" className="modal-title">
              Supprimer « {deleteTarget.nom} » ?
            </h2>
            <p className="modal-text">
              Cette action est définitive et retirera cet article de ton inventaire.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={closeDeleteModal}>
                Annuler
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}