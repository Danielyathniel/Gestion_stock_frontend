import api from "../api";

function toFrontend(mouvement) {
    return {
        id: mouvement.id,
        article: mouvement.article?.nom ?? "",
        articleReference: mouvement.article?.reference ?? "",
        articleUnite: mouvement.article?.unite ?? "unité(s)",
        articleId: mouvement.article_id,
        quantite: mouvement.quantite,
        date: mouvement.date_mouvement,
        motif: mouvement.motif,
        observation: mouvement.observation ?? "",
        stockActuel: mouvement.stock_apres_mouvement ?? 0,
        user: mouvement.user?.name ?? "",
    };
}


export async function fetchTypeMouvements() {
    const {data} = await api.get('/type-mouvements');
    return data;
}

export async function fetchEntrees() {
    const {data} = await api.get("/mouvements", {
        params: {type: "entree"},
    });
    return data.map(toFrontend);
}


export async function createEntree(payload) {
    const { data } = await api.post("/mouvements", {
        article_id: payload.articleId,
        type_mouvement_id: payload.typeMouvementId,
        quantite: payload.quantite,
        date_mouvement: payload.date,
        motif: payload.motif,
        observation: payload.observation,
    });
return toFrontend(data);
}