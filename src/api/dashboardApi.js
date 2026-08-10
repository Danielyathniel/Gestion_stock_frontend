import { getDb, delay } from "./mockDb";
import { stockStatus } from "./articlesApi";

// --- Équivalent Laravel à terme : GET /api/dashboard ---

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export async function getDashboardData() {
  await delay(400);
  const db = getDb();

  const totalArticles = db.articles.length;
  const totalCategories = db.categories.length;
  const entrees = db.mouvements_stock.filter((m) => m.type_mouvement_id === 1);
  const sorties = db.mouvements_stock.filter((m) => m.type_mouvement_id === 2);

  const valeurStock = db.articles.reduce((sum, a) => sum + a.stock_actuel * a.prix_achat, 0);

  const enrichedArticles = db.articles.map((a) => ({ ...a, statut: stockStatus(a) }));
  const rupture = enrichedArticles.filter((a) => a.statut === "rupture").length;
  const faible = enrichedArticles.filter((a) => a.statut === "faible").length;

  const days = lastNDays(7);
  const evolution = days.map((day) => ({
    date: day.slice(5),
    Entrées: db.mouvements_stock
      .filter((m) => m.type_mouvement_id === 1 && m.date_mouvement === day)
      .reduce((s, m) => s + m.quantite, 0),
    Sorties: db.mouvements_stock
      .filter((m) => m.type_mouvement_id === 2 && m.date_mouvement === day)
      .reduce((s, m) => s + m.quantite, 0),
  }));

  const stockParCategorie = db.categories.map((c) => ({
    categorie: c.nom,
    stock: db.articles
      .filter((a) => a.categorie_id === c.id)
      .reduce((s, a) => s + a.stock_actuel, 0),
  }));

  return {
    stats: {
      totalArticles,
      totalCategories,
      totalEntrees: entrees.length,
      totalSorties: sorties.length,
      valeurStock,
      rupture,
      faible,
    },
    evolution,
    stockParCategorie,
    alertes: enrichedArticles
      .filter((a) => a.statut !== "ok")
      .sort((a, b) => a.stock_actuel - b.stock_actuel)
      .slice(0, 6),
  };
}
