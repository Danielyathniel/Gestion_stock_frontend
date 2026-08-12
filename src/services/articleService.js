import api from "./api";

function toFrontend(article) {
  return {
    id: article.id,
    reference: article.reference,
    nom: article.nom,
    description: article.description ?? "",
    categorie: article.categorie?.nom ?? "",
    categorieId: article.categorie_id,
    prixAchat: Number(article.prix_achat),
    prixVente: Number(article.prix_vente),
    stock: article.stock_actuel,
    stockMin: article.stock_minimum,
    unite: article.unite,
    dateCreation: article.created_at,
  };
}

function toBackend(form) {
  return {
    reference: form.reference,
    nom: form.nom,
    description: form.description,
    categorie_id: form.categorieId,
    prix_achat: Number(form.prixAchat),
    prix_vente: Number(form.prixVente),
    stock_actuel: Number(form.stock),
    stock_minimum: Number(form.stockMin),
    unite: form.unite,
  };
}

export async function fetchArticles({ search = "", categorieId = "", stock = "" } = {}) {
  const { data } = await api.get("/articles", {
    params: {
      search: search || undefined,
      categorie_id: categorieId || undefined,
      stock: stock || undefined,
    },
  });
  return data.map(toFrontend);
}

export async function createArticle(form) {
  const { data } = await api.post("/articles", toBackend(form));
  return toFrontend(data);
}

export async function updateArticle(id, form) {
  const { data } = await api.put(`/articles/${id}`, toBackend(form));
  return toFrontend(data);
}

export async function deleteArticle(id) {
  await api.delete(`/articles/${id}`);
}