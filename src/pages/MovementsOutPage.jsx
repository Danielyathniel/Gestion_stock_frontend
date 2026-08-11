import { useState } from "react";
import {
  Package,
  ArrowUpFromLine,
  Calendar,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Inbox,
} from "lucide-react";
import "./MovementsOutPage.css";

// --- Données mock (à remplacer par un appel API plus tard) ---
const initialArticles = [
  { id: 1, nom: "Souris Logitech", reference: "LOG-MS-001", stock: 25 },
  { id: 2, nom: "Clavier mécanique Redragon", reference: "RDG-KB-014", stock: 12 },
  { id: 3, nom: "Écran Dell 24\"", reference: "DEL-MN-024", stock: 8 },
  { id: 4, nom: "Câble HDMI 2m", reference: "CBL-HD-002", stock: 40 },
  { id: 5, nom: "Disque SSD 1To", reference: "SSD-1TB-01", stock: 5 },
];

const initialMouvements = [
  {
    id: 1,
    article: "Câble HDMI 2m",
    quantite: 5,
    date: "2026-08-06",
    motif: "Vente",
    observation: "",
    nouveauStock: 40,
  },
];

const motifs = [
  "Vente",
  "Casse / Perte",
  "Transfert vers un autre site",
  "Correction d'inventaire",
  "Autre",
];

const todayISO = () => new Date().toISOString().split("T")[0];

const emptyForm = {
  articleId: "",
  quantite: "",
  date: todayISO(),
  motif: "",
  observation: "",
};

export default function MovementsOutPage() {
  const [articles, setArticles] = useState(initialArticles);
  const [mouvements, setMouvements] = useState(initialMouvements);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [confirmation, setConfirmation] = useState(null);

  const selectedArticle = articles.find(
    (a) => String(a.id) === String(form.articleId)
  );

  function openForm() {
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
  }

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const e = {};
    const article = articles.find((a) => String(a.id) === String(form.articleId));

    if (!form.articleId) e.articleId = "Sélectionne un article.";

    const qte = Number(form.quantite);
    if (!form.quantite) {
      e.quantite = "Indique une quantité.";
    } else if (!Number.isFinite(qte) || qte <= 0) {
      e.quantite = "La quantité doit être un nombre positif.";
    } else if (article && qte > article.stock) {
      e.quantite = `Stock insuffisant (disponible : ${article.stock}).`;
    }

    if (!form.date) e.date = "Indique une date.";
    if (!form.motif) e.motif = "Sélectionne un motif.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    if (!validate()) return;

    const qte = Number(form.quantite);
    const article = articles.find((a) => String(a.id) === String(form.articleId));
    const ancienStock = article.stock;
    const nouveauStock = ancienStock - qte;

    setArticles((list) =>
      list.map((a) => (a.id === article.id ? { ...a, stock: nouveauStock } : a))
    );

    setMouvements((m) => [
      {
        id: Date.now(),
        article: article.nom,
        quantite: qte,
        date: form.date,
        motif: form.motif,
        observation: form.observation,
        nouveauStock,
      },
      ...m,
    ]);

    setConfirmation({
      article: article.nom,
      ancienStock,
      nouveauStock,
      quantite: qte,
    });

    setShowForm(false);

    // Le message de confirmation se referme tout seul après un moment
    setTimeout(() => setConfirmation(null), 5000);
  }

  return (
    <div className="stock-out-page">
      <div className="stock-out-container">
        {/* Header */}
        <div className="stock-out-header">
          <div>
            <h1 className="page-title">Mouvements de sortie</h1>
            <p className="page-subtitle">
              Historique des sorties de stock enregistrées.
            </p>
          </div>
          <button type="button" className="stock-out-add-btn" onClick={openForm}>
            <Plus size={16} />
            Ajouter
          </button>
        </div>

        {/* Confirmation */}
        {confirmation && (
          <div className="stock-out-confirmation">
            <CheckCircle2 size={18} className="stock-out-confirmation-icon" />
            <div>
              <p className="stock-out-confirmation-title">Sortie enregistrée avec succès.</p>
              <p className="stock-out-confirmation-detail">
                {confirmation.article} : {confirmation.ancienStock} − {confirmation.quantite} ={" "}
                <span>{confirmation.nouveauStock} unités</span>
              </p>
            </div>
          </div>
        )}

        {/* Liste des mouvements */}
        {mouvements.length === 0 ? (
          <div className="stock-out-empty">
            <Inbox size={28} />
            <p>Aucun mouvement de sortie enregistré pour l'instant.</p>
            <button type="button" className="stock-out-add-btn" onClick={openForm}>
              <Plus size={16} />
              Ajouter une sortie
            </button>
          </div>
        ) : (
          <div className="stock-out-table-wrap">
            <table className="stock-out-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Quantité</th>
                  <th>Date</th>
                  <th>Motif</th>
                  <th>Observation</th>
                  <th>Nouveau stock</th>
                </tr>
              </thead>
              <tbody>
                {mouvements.map((m) => (
                  <tr key={m.id}>
                    <td>{m.article}</td>
                    <td className="stock-out-qty-cell">−{m.quantite}</td>
                    <td>{m.date}</td>
                    <td>{m.motif}</td>
                    <td className="stock-out-obs-cell">{m.observation || "—"}</td>
                    <td className="stock-out-new-stock-cell">{m.nouveauStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modale du formulaire */}
        {showForm && (
          <div className="stock-out-modal-overlay" onClick={closeForm}>
            <div
              className="stock-out-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stock-out-modal-header">
                <h2 className="stock-out-modal-title">
                  <ArrowUpFromLine size={18} />
                  Nouvelle sortie de stock
                </h2>
                <button
                  type="button"
                  className="stock-out-modal-close"
                  onClick={closeForm}
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="stock-out-form" noValidate>
                <div className="stock-out-grid">
                  {/* Article */}
                  <div className="stock-out-field stock-out-field--full">
                    <label className="stock-out-label">
                      <Package size={15} />
                      Article
                    </label>
                    <select
                      value={form.articleId}
                      onChange={(e) => updateField("articleId", e.target.value)}
                      className={`stock-out-input ${errors.articleId ? "stock-out-input--error" : ""}`}
                    >
                      <option value="">Sélectionner un article…</option>
                      {articles.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nom} — réf. {a.reference} (stock actuel : {a.stock})
                        </option>
                      ))}
                    </select>
                    {errors.articleId && (
                      <p className="stock-out-error">
                        <AlertCircle size={12} /> {errors.articleId}
                      </p>
                    )}
                    {selectedArticle && !errors.articleId && (
                      <p className="stock-out-hint">
                        Stock disponible : <strong>{selectedArticle.stock}</strong> unités
                      </p>
                    )}
                  </div>

                  {/* Quantité */}
                  <div className="stock-out-field">
                    <label className="stock-out-label">Quantité sortie</label>
                    <input
                      type="number"
                      min="1"
                      value={form.quantite}
                      onChange={(e) => updateField("quantite", e.target.value)}
                      placeholder="ex. 5"
                      className={`stock-out-input ${errors.quantite ? "stock-out-input--error" : ""}`}
                    />
                    {errors.quantite && (
                      <p className="stock-out-error">
                        <AlertCircle size={12} /> {errors.quantite}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="stock-out-field">
                    <label className="stock-out-label">
                      <Calendar size={15} />
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => updateField("date", e.target.value)}
                      className={`stock-out-input ${errors.date ? "stock-out-input--error" : ""}`}
                    />
                    {errors.date && (
                      <p className="stock-out-error">
                        <AlertCircle size={12} /> {errors.date}
                      </p>
                    )}
                  </div>

                  {/* Motif */}
                  <div className="stock-out-field stock-out-field--full">
                    <label className="stock-out-label">Motif</label>
                    <select
                      value={form.motif}
                      onChange={(e) => updateField("motif", e.target.value)}
                      className={`stock-out-input ${errors.motif ? "stock-out-input--error" : ""}`}
                    >
                      <option value="">Sélectionner un motif…</option>
                      {motifs.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {errors.motif && (
                      <p className="stock-out-error">
                        <AlertCircle size={12} /> {errors.motif}
                      </p>
                    )}
                  </div>

                  {/* Observation */}
                  <div className="stock-out-field stock-out-field--full">
                    <label className="stock-out-label">
                      <ClipboardList size={15} />
                      Observation <span className="stock-out-optional">(facultatif)</span>
                    </label>
                    <textarea
                      value={form.observation}
                      onChange={(e) => updateField("observation", e.target.value)}
                      rows={3}
                      placeholder="Remarque éventuelle sur cette sortie…"
                      className="stock-out-input stock-out-textarea"
                    />
                  </div>
                </div>

                <div className="stock-out-modal-actions">
                  <button type="button" className="stock-out-cancel-btn" onClick={closeForm}>
                    Annuler
                  </button>
                  <button type="submit" className="stock-out-submit">
                    <ArrowUpFromLine size={16} />
                    Enregistrer la sortie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}