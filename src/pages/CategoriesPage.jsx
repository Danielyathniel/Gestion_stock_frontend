import { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import * as categoriesApi from "../api/categoriesApi";

export default function CategoriesPage() {
  const { notify } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | {} | category
  const [toDelete, setToDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      setCategories(await categoriesApi.listCategories());
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.nom.toLowerCase().includes(q));
  }, [categories, search]);

  async function handleDelete() {
    try {
      await categoriesApi.deleteCategory(toDelete.id);
      notify("Catégorie supprimée.", "success");
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
          <h2>Catégories</h2>
          <p>Regroupez vos articles par famille d'inventaire.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          + Ajouter une catégorie
        </button>
      </div>

      <div className="filters-row">
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Catégorie</th>
                <th>Articles rattachés</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 32, color: "var(--color-ink-soft)" }}>
                    Chargement...
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--color-ink-soft)" }}>#{c.id}</td>
                    <td style={{ fontWeight: 600 }}>{c.nom}</td>
                    <td>{c.articles_count}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(c)}>
                          Modifier
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setToDelete(c)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <h3>Aucune catégorie</h3>
                      <p>Ajoutez votre première catégorie pour commencer.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <CategoryFormModal
          category={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer la catégorie"
          message={`Voulez-vous vraiment supprimer "${toDelete.nom}" ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          danger
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

function CategoryFormModal({ category, onClose, onSaved }) {
  const { notify } = useToast();
  const [nom, setNom] = useState(category?.nom || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (category) {
        await categoriesApi.updateCategory(category.id, { nom });
        notify("Catégorie modifiée.", "success");
      } else {
        await categoriesApi.createCategory({ nom });
        notify("Catégorie créée.", "success");
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={category ? "Modifier la catégorie" : "Nouvelle catégorie"} onClose={onClose} width="420px">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nom">Nom de la catégorie</label>
          <input
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="ex : Informatique"
            autoFocus
            required
          />
        </div>
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
