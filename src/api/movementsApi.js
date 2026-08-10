import { getDb, saveDb, nextId, delay } from "./mockDb";

// --- Équivalents Laravel à terme ---
// GET  /api/mouvements?type=IN|OUT&article_id=&from=&to=
// POST /api/mouvements   { article_id, type_mouvement_id, quantite, date_mouvement, motif, observation }

const TYPE_IN = 1;
const TYPE_OUT = 2;

function enrich(db, m) {
  const article = db.articles.find((a) => a.id === m.article_id);
  const user = db.users.find((u) => u.id === m.user_id);
  const type = db.type_mouvements.find((t) => t.id === m.type_mouvement_id);
  return {
    ...m,
    article_nom: article ? article.nom : "Article supprimé",
    article_reference: article ? article.reference : "—",
    unite: article ? article.unite : "",
    user_nom: user ? user.name : "Utilisateur inconnu",
    type_libelle: type ? type.libelle : "—",
    type_code: type ? type.code : "—",
  };
}

export async function listMovements({ type = "", articleId = "", from = "", to = "" } = {}) {
  await delay();
  const db = getDb();
  let items = db.mouvements_stock.map((m) => enrich(db, m));

  if (type === "IN") items = items.filter((m) => m.type_mouvement_id === TYPE_IN);
  if (type === "OUT") items = items.filter((m) => m.type_mouvement_id === TYPE_OUT);
  if (articleId) items = items.filter((m) => String(m.article_id) === String(articleId));
  if (from) items = items.filter((m) => m.date_mouvement >= from);
  if (to) items = items.filter((m) => m.date_mouvement <= to);

  return items.sort((a, b) => (a.date_mouvement < b.date_mouvement ? 1 : -1) || b.id - a.id);
}

// currentUserId is passed in from AuthContext so every movement is traced
// back to the connected user, as required by the spec.
export async function registerMovement(currentUserId, payload) {
  await delay(450);
  const db = getDb();

  const article = db.articles.find((a) => a.id === Number(payload.article_id));
  if (!article) throw new Error("Article introuvable.");

  const quantite = Number(payload.quantite);
  if (!quantite || quantite <= 0) throw new Error("La quantité doit être un nombre positif.");
  if (!payload.date_mouvement) throw new Error("La date est obligatoire.");
  if (!payload.motif?.trim()) throw new Error("Le motif est obligatoire.");

  const isEntree = payload.type === "IN";
  const type_mouvement_id = isEntree ? TYPE_IN : TYPE_OUT;

  if (!isEntree && quantite > article.stock_actuel) {
    throw new Error(
      `Stock insuffisant : disponible ${article.stock_actuel} ${article.unite}, sortie demandée ${quantite}.`
    );
  }

  const movement = {
    id: nextId(db, "mouvements_stock"),
    article_id: article.id,
    user_id: currentUserId,
    type_mouvement_id,
    quantite,
    date_mouvement: payload.date_mouvement,
    motif: payload.motif.trim(),
    observation: payload.observation?.trim() || "",
  };
  db.mouvements_stock.push(movement);

  article.stock_actuel = isEntree
    ? article.stock_actuel + quantite
    : article.stock_actuel - quantite;

  saveDb(db);
  return { movement: enrich(db, movement), newStock: article.stock_actuel };
}
