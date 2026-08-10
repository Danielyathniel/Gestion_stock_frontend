// ---------------------------------------------------------------------------
// mockDb.js
//
// Simule la base de données décrite dans le document d'architecture
// (users, categories, articles, type_mouvements, mouvements_stock).
// Les données sont persistées dans localStorage pour que l'app se comporte
// comme une vraie API entre deux rechargements de page.
//
// Quand le backend Laravel sera prêt, il suffira de remplacer le contenu des
// fichiers src/api/*Api.js par de vrais appels axios/fetch vers
// /api/... — les composants React n'ont pas à changer, ils consomment déjà
// une interface asynchrone (voir chaque fichier `xxxApi.js`).
// ---------------------------------------------------------------------------

const STORAGE_KEY = "stockflow_mock_db_v1";

const TYPE_MOUVEMENTS = [
  { id: 1, libelle: "ENTREE", code: "IN" },
  { id: 2, libelle: "SORTIE", code: "OUT" },
];

function seed() {
  const now = new Date().toISOString();
  const categories = [
    { id: 1, nom: "Informatique", created_at: now },
    { id: 2, nom: "Fournitures", created_at: now },
    { id: 3, nom: "Nettoyage", created_at: now },
  ];

  const articles = [
    {
      id: 1,
      reference: "ART-001",
      nom: "Souris Logitech",
      description: "Souris optique sans fil",
      categorie_id: 1,
      prix_achat: 8500,
      prix_vente: 12000,
      stock_actuel: 25,
      stock_minimum: 5,
      unite: "Unité",
      created_at: now,
    },
    {
      id: 2,
      reference: "ART-002",
      nom: "Clavier HP",
      description: "Clavier filaire AZERTY",
      categorie_id: 1,
      prix_achat: 11000,
      prix_vente: 16500,
      stock_actuel: 8,
      stock_minimum: 10,
      unite: "Unité",
      created_at: now,
    },
    {
      id: 3,
      reference: "ART-003",
      nom: "Papier A4",
      description: "Ramette 500 feuilles, 80g/m²",
      categorie_id: 2,
      prix_achat: 3200,
      prix_vente: 4500,
      stock_actuel: 0,
      stock_minimum: 20,
      unite: "Ramme",
      created_at: now,
    },
    {
      id: 4,
      reference: "ART-004",
      nom: "Liquide vaisselle",
      description: "Bidon 5L",
      categorie_id: 3,
      prix_achat: 2500,
      prix_vente: 3800,
      stock_actuel: 14,
      stock_minimum: 6,
      unite: "Bidon",
      created_at: now,
    },
    {
      id: 5,
      reference: "ART-005",
      nom: "Stylo bille bleu",
      description: "Boîte de 50",
      categorie_id: 2,
      prix_achat: 4000,
      prix_vente: 6000,
      stock_actuel: 3,
      stock_minimum: 5,
      unite: "Boîte",
      created_at: now,
    },
  ];

  const users = [
    { id: 1, name: "Admin StockFlow", email: "admin@stockflow.test", password: "admin123" },
    { id: 2, name: "Fatou Adjovi", email: "fatou@stockflow.test", password: "admin123" },
  ];

  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  const mouvements = [
    { id: 1, article_id: 1, user_id: 1, type_mouvement_id: 1, quantite: 20, date_mouvement: daysAgo(9), motif: "Achat fournisseur", observation: "BL-1023" },
    { id: 2, article_id: 1, user_id: 2, type_mouvement_id: 2, quantite: 5, date_mouvement: daysAgo(8), motif: "Vente client", observation: "" },
    { id: 3, article_id: 2, user_id: 1, type_mouvement_id: 1, quantite: 15, date_mouvement: daysAgo(7), motif: "Achat fournisseur", observation: "" },
    { id: 4, article_id: 2, user_id: 2, type_mouvement_id: 2, quantite: 7, date_mouvement: daysAgo(6), motif: "Vente client", observation: "" },
    { id: 5, article_id: 3, user_id: 1, type_mouvement_id: 1, quantite: 50, date_mouvement: daysAgo(5), motif: "Livraison", observation: "" },
    { id: 6, article_id: 3, user_id: 2, type_mouvement_id: 2, quantite: 50, date_mouvement: daysAgo(4), motif: "Vente client", observation: "Rupture après vente" },
    { id: 7, article_id: 4, user_id: 1, type_mouvement_id: 1, quantite: 20, date_mouvement: daysAgo(4), motif: "Achat fournisseur", observation: "" },
    { id: 8, article_id: 4, user_id: 2, type_mouvement_id: 2, quantite: 6, date_mouvement: daysAgo(3), motif: "Casse", observation: "" },
    { id: 9, article_id: 5, user_id: 1, type_mouvement_id: 1, quantite: 10, date_mouvement: daysAgo(2), motif: "Achat fournisseur", observation: "" },
    { id: 10, article_id: 5, user_id: 2, type_mouvement_id: 2, quantite: 7, date_mouvement: daysAgo(1), motif: "Vente client", observation: "" },
    { id: 11, article_id: 1, user_id: 1, type_mouvement_id: 2, quantite: 3, date_mouvement: daysAgo(0), motif: "Vente client", observation: "" },
  ];

  return {
    users,
    categories,
    articles,
    type_mouvements: TYPE_MOUVEMENTS,
    mouvements_stock: mouvements,
    _sequences: { categories: 4, articles: 6, mouvements_stock: 12 },
  };
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function persist(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDb() {
  const initial = seed();
  persist(initial);
  return initial;
}

export function getDb() {
  return load();
}

export function nextId(db, table) {
  db._sequences[table] = (db._sequences[table] || 0) + 1;
  return db._sequences[table];
}

export function saveDb(db) {
  persist(db);
}

// Simulates network latency so loading states feel real.
export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
