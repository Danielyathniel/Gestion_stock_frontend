import { getDb, saveDb, nextId, delay } from "./mockDb";

// --- Équivalents Laravel à terme ---
// GET    /api/articles?search=&categorie_id=&stock=rupture|faible
// GET    /api/articles/{id}
// POST   /api/articles
// PUT    /api/articles/{id}
// DELETE /api/articles/{id}

export function stockStatus(article) {
  if (article.stock_actuel <= 0) return "rupture";
  if (article.stock_actuel <= article.stock_minimum) return "faible";
  return "ok";
}

function enrich(db, article) {
  const categorie = db.categories.find((c) => c.id === article.categorie_id);
  return { ...article, categorie_nom: categorie ? categorie.nom : "—", statut_stock: stockStatus(article) };
}

export async function listArticles({ search = "", categorieId = "", stock = "" } = {}) {
  await delay();
  const db = getDb();
  let items = db.articles.map((a) => enrich(db, a));

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (a) => a.nom.toLowerCase().includes(q) || a.reference.toLowerCase().includes(q)
    );
  }
  if (categorieId) {
    items = items.filter((a) => String(a.categorie_id) === String(categorieId));
  }
  if (stock === "rupture") items = items.filter((a) => a.statut_stock === "rupture");
  if (stock === "faible") items = items.filter((a) => a.statut_stock === "faible");

  return items.sort((a, b) => a.nom.localeCompare(b.nom));
}

export async function getArticle(id) {
  await delay();
  const db = getDb();
  const article = db.articles.find((a) => a.id === Number(id));
  if (!article) throw new Error("Article introuvable.");
  return enrich(db, article);
}

function validate(payload) {
  if (!payload.reference?.trim()) throw new Error("La référence est obligatoire.");
  if (!payload.nom?.trim()) throw new Error("Le nom est obligatoire.");
  if (!payload.categorie_id) throw new Error("La catégorie est obligatoire.");
  if (payload.prix_achat < 0 || payload.prix_vente < 0) throw new Error("Les prix ne peuvent pas être négatifs.");
}

export async function createArticle(payload) {
  await delay();
  const db = getDb();
  validate(payload);
  if (db.articles.some((a) => a.reference.toLowerCase() === payload.reference.trim().toLowerCase())) {
    throw new Error("Cette référence existe déjà.");
  }
  const article = {
    id: nextId(db, "articles"),
    reference: payload.reference.trim(),
    nom: payload.nom.trim(),
    description: payload.description?.trim() || "",
    categorie_id: Number(payload.categorie_id),
    prix_achat: Number(payload.prix_achat) || 0,
    prix_vente: Number(payload.prix_vente) || 0,
    stock_actuel: Number(payload.stock_actuel) || 0,
    stock_minimum: Number(payload.stock_minimum) || 0,
    unite: payload.unite?.trim() || "Unité",
    created_at: new Date().toISOString(),
  };
  db.articles.push(article);
  saveDb(db);
  return enrich(db, article);
}

export async function updateArticle(id, payload) {
  await delay();
  const db = getDb();
  validate(payload);
  const article = db.articles.find((a) => a.id === Number(id));
  if (!article) throw new Error("Article introuvable.");
  if (
    db.articles.some(
      (a) => a.id !== article.id && a.reference.toLowerCase() === payload.reference.trim().toLowerCase()
    )
  ) {
    throw new Error("Cette référence existe déjà.");
  }
  Object.assign(article, {
    reference: payload.reference.trim(),
    nom: payload.nom.trim(),
    description: payload.description?.trim() || "",
    categorie_id: Number(payload.categorie_id),
    prix_achat: Number(payload.prix_achat) || 0,
    prix_vente: Number(payload.prix_vente) || 0,
    stock_minimum: Number(payload.stock_minimum) || 0,
    unite: payload.unite?.trim() || "Unité",
  });
  saveDb(db);
  return enrich(db, article);
}

export async function deleteArticle(id) {
  await delay();
  const db = getDb();
  const used = db.mouvements_stock.some((m) => m.article_id === Number(id));
  if (used) {
    throw new Error("Impossible de supprimer : cet article a des mouvements de stock enregistrés.");
  }
  db.articles = db.articles.filter((a) => a.id !== Number(id));
  saveDb(db);
  return true;
}
