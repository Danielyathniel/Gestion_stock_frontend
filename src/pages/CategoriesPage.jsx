import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categorieService";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import "./CategoriesPage.css";

const EXIT_DURATION = 220;

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteError, setDeleteError] = useState(null); // 🔴 NOUVEAU : pour l'erreur de suppression

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  function loadCategories() {
    setIsLoading(true);
    setLoadError("");
    fetchCategories()
      .then(setCategories)
      .catch(() => setLoadError("Impossible de charger les catégories."))
      .finally(() => setIsLoading(false));
  }

  function showSuccess(message) {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(""), 3000);
  }

  function showPageError(message) {
    setPageError(message);
    window.setTimeout(() => setPageError(""), 4000);
  }

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((cat) => cat.nom.toLowerCase().includes(query));
  }, [categories, search]);

  function openAddModal() {
    setNameInput("");
    setFormError("");
    setModal({ mode: "add" });
  }

  function openEditModal(category) {
    setNameInput(category.nom);
    setFormError("");
    setModal({ mode: "edit", category });
  }

  function closeModal() {
    setModal((prev) => (prev ? { ...prev, closing: true } : prev));
    window.setTimeout(() => {
      setModal(null);
      setNameInput("");
      setFormError("");
    }, EXIT_DURATION);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = nameInput.trim();

    if (!trimmed) {
      setFormError("Le nom de la catégorie est obligatoire.");
      return;
    }
    const hasAtLeastOneLetter = /[a-zA-ZÀ-ÿ]/.test(trimmed);
      if (!hasAtLeastOneLetter) {
        setFormError("Le nom de la catégorie doit contenir au moins une lettre.");
        return;
      }
    const isDuplicate = categories.some(
      (cat) =>
        cat.nom.toLowerCase() === trimmed.toLowerCase() && cat.id !== modal.category?.id
    );

    if (isDuplicate) {
      setFormError("Cette catégorie existe déjà.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (modal.mode === "add") {
        const nouvelleCategorie = await createCategory({ nom: trimmed });
        setCategories((prev) => [...prev, nouvelleCategorie]);
        showSuccess("Catégorie ajoutée avec succès.");
      } else {
        const categorieModifiee = await updateCategory(modal.category.id, { nom: trimmed });
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === modal.category.id ? categorieModifiee : cat
          )
        );
        showSuccess("Modification enregistrée.");
      }
      closeModal();
    } catch (err) {
      const apiMessage =
        err.response?.data?.errors?.nom?.[0] ||
        err.response?.data?.message ||
        "Une erreur est survenue, réessaie.";
      setFormError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestDelete(category) {
    setDeleteTarget(category);
  }

  function closeDeleteModal() {
    setDeleteTarget((prev) => (prev ? { ...prev, closing: true } : prev));
    window.setTimeout(() => setDeleteTarget(null), EXIT_DURATION);
  }

  async function confirmDelete() {
    const target = deleteTarget;
    
    // Fermer la modale de confirmation
    setDeleteTarget((prev) => (prev ? { ...prev, closing: true } : prev));

    window.setTimeout(() => {
      setDeleteTarget(null);
      setRemovingId(target.id);
    }, EXIT_DURATION);

    try {
      await deleteCategory(target.id);
      window.setTimeout(() => {
        setCategories((prev) => prev.filter((cat) => cat.id !== target.id));
        setRemovingId(null);
        showSuccess("Catégorie supprimée avec succès.");
      }, EXIT_DURATION);
    } catch (err) {
      setRemovingId(null);
      // 🔴 AFFICHER L'ERREUR DANS UNE MODALE
      setDeleteError({
        title: "⚠️ Impossible de supprimer",
        message: err.response?.data?.message || 
          "Cette catégorie est utilisée par des articles. Supprimez ou réassignez les articles avant de supprimer la catégorie."
      });
    }
  }

  return (
    <div className="categories-page">
      <div className={`categories-content${mounted ? " is-mounted" : ""}`}>
        <h1 className="page-title">Catégories</h1>
        <p className="page-subtitle">Gère les familles d'articles de ton stock.</p>

        {pageError && <p className="modal-error">{pageError}</p>}
        {successMessage && <p className="modal-success">{successMessage}</p>}

        <div className="categories-toolbar">
          <div className="categories-search">
            <span className="categories-search-icon" aria-hidden="true">⌕</span>
            <input
              type="text"
              placeholder="Rechercher une catégorie…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher une catégorie"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={openAddModal}>
            + Ajouter une catégorie
          </button>
        </div>

        <div className="categories-table-wrap">
          <table className="categories-table">
            <thead>
              <tr>
                <th className="col-id">ID</th>
                <th>Catégorie</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="categories-empty">
                    Chargement des catégories…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={3} className="categories-empty">
                    {loadError}
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr className="row-enter">
                  <td colSpan={3} className="categories-empty">
                    {search
                      ? "Aucune catégorie ne correspond à ta recherche."
                      : "Aucune catégorie pour le moment. Ajoutes-en une pour commencer."}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, index) => (
                  <tr
                    key={cat.id}
                    className={`row-enter${cat.id === removingId ? " row-exit" : ""}`}
                    style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                  >
                    <td className="col-id">{index + 1}</td>
                    <td>{cat.nom}</td>
                    <td className="col-actions">
                      <div className="action-menu-wrapper" ref={openMenuId === cat.id ? menuRef : null}>
                        <button
                          type="button"
                          className="action-menu-trigger"
                          onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                          aria-label="Actions"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openMenuId === cat.id && (
                          <div className="action-menu-dropdown">
                            <button
                              type="button"
                              className="action-menu-item"
                              onClick={() => { setOpenMenuId(null); openEditModal(cat); }}
                            >
                              <Pencil size={15} />
                              Modifier
                            </button>
                            <button
                              type="button"
                              className="action-menu-item action-menu-item--danger"
                              onClick={() => { setOpenMenuId(null); requestDelete(cat); }}
                            >
                              <Trash2 size={15} />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
            className={`modal-box${modal.closing ? " is-closing" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="category-modal-title" className="modal-title">
              {modal.mode === "add" ? "Ajouter une catégorie" : "Modifier la catégorie"}
            </h2>
            <form onSubmit={handleSubmit}>
              <label className="modal-label" htmlFor="category-name">
                Nom de la catégorie
              </label>
              <input
                id="category-name"
                type="text"
                className="modal-input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ex : Informatique"
                autoFocus
              />
              {formError && <p className="modal-error">{formError}</p>}

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Enregistrement…"
                    : modal.mode === "add"
                    ? "Ajouter"
                    : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION DE SUPPRESSION */}
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
              Cette action est définitive. Les articles liés à cette catégorie
              devront être réassignés.
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

      {/* 🔴 MODALE D'ERREUR DE SUPPRESSION */}
      {deleteError && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteError(null)}
        >
          <div
            className="modal-box modal-box--danger"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="error-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon-error"></div>
            <h2 id="error-modal-title" className="modal-title modal-title--danger">
              {deleteError.title}
            </h2>
            <p className="modal-text modal-text--danger">
              {deleteError.message}
            </p>
            <div className="modal-actions modal-actions--center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setDeleteError(null)}
                autoFocus
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}