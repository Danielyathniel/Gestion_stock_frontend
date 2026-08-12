import api from "./api";

export function getCategories() {
  return api.get("/categories").then((res) => res.data);
}

export function createCategorie(nom) {
  return api.post("/categories", { nom }).then((res) => res.data);
}

export function updateCategorie(id, nom) {
  return api.put(`/categories/${id}`, { nom }).then((res) => res.data);
}

export function deleteCategorie(id) {
  return api.delete(`/categories/${id}`);
}