import { getDb, saveDb, nextId, delay } from "./mockDb";

// --- Équivalents Laravel côté React Router à terme ---
// GET    /api/categories
// POST   /api/categories
// PUT    /api/categories/{id}
// DELETE /api/categories/{id}

export async function listCategories() {
  await delay();
  const db = getDb();
  return db.categories
    .map((c) => ({
      ...c,
      articles_count: db.articles.filter((a) => a.categorie_id === c.id).length,
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom));
}

export async function createCategory(payload) {
  await delay();
  const db = getDb();
  const nom = payload.nom.trim();
  if (!nom) throw new Error("Le nom de la catégorie est obligatoire.");
  if (db.categories.some((c) => c.nom.toLowerCase() === nom.toLowerCase())) {
    throw new Error("Cette catégorie existe déjà.");
  }
  const category = { id: nextId(db, "categories"), nom, created_at: new Date().toISOString() };
  db.categories.push(category);
  saveDb(db);
  return category;
}

export async function updateCategory(id, payload) {
  await delay();
  const db = getDb();
  const nom = payload.nom.trim();
  if (!nom) throw new Error("Le nom de la catégorie est obligatoire.");
  if (db.categories.some((c) => c.id !== id && c.nom.toLowerCase() === nom.toLowerCase())) {
    throw new Error("Cette catégorie existe déjà.");
  }
  const category = db.categories.find((c) => c.id === id);
  if (!category) throw new Error("Catégorie introuvable.");
  category.nom = nom;
  saveDb(db);
  return category;
}

export async function deleteCategory(id) {
  await delay();
  const db = getDb();
  const used = db.articles.some((a) => a.categorie_id === id);
  if (used) {
    throw new Error("Impossible de supprimer : des articles sont rattachés à cette catégorie.");
  }
  db.categories = db.categories.filter((c) => c.id !== id);
  saveDb(db);
  return true;
}
