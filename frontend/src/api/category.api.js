import api from "./axios";

export const categoryApi = {
  getAll: () => api.get("/categories").then((res) => res.data),
  getById: (id) => api.get(`/categories/${id}`).then((res) => res.data),
  create: (data) => api.post("/categories/Create", data).then((res) => res.data),
  update: (id, data) => api.put(`/categories/update/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/categories/delete/${id}`).then((res) => res.data),
};
