import api from "./api";

function toFrontend(category) {
  return {
    id: category.id,
    nom: category.nom,
    articlesCount: category.articles_count ?? undefined,
    dateCreation: category.created_at,
  };
}

function toBackend(form) {
  return {
    nom: form.nom,
  };
}

export async function fetchCategories({ search = "" } = {}) {
  const { data } = await api.get("/categories", {
    params: {
      search: search || undefined,
    },
  });
  return data.map(toFrontend);
}

export async function createCategory(form) {
  const { data } = await api.post("/categories", toBackend(form));
  return toFrontend(data);
}

export async function updateCategory(id, form) {
  const { data } = await api.put(`/categories/${id}`, toBackend(form));
  return toFrontend(data);
}

export async function deleteCategory(id) {
  await api.delete(`/categories/${id}`);
}