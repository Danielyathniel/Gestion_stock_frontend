import api from "./api";

function toFrontend(mouvement) {
  return {
    id: mouvement.id,
    article: mouvement.article?.nom ?? "",
    articleId: mouvement.article_id,
    quantite: mouvement.quantite,
    date: mouvement.date_mouvement,
    motif: mouvement.motif,
    observation: mouvement.observation ?? "",
    stockActuel: mouvement.article?.stock_actuel ?? 0,
  };
}

function toBackend(form, typeMouvementId) {
  return {
    article_id: Number(form.articleId),
    type_mouvement_id: typeMouvementId,
    quantite: Number(form.quantite),
    date_mouvement: form.date,
    motif: form.motif,
    observation: form.observation || null,
  };
}

export async function fetchTypeMouvements() {
  const { data } = await api.get("/type-mouvements");
  return data;
}

export async function fetchSorties() {
  const { data } = await api.get("/mouvements", {
    params: { type: "sortie" },
  });
  return data.map(toFrontend);
}

export async function createSortie(form, typeMouvementId) {
  const { data } = await api.post("/mouvements", toBackend(form, typeMouvementId));
  return toFrontend(data);
}
