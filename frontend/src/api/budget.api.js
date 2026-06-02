import api from "./axios";

export const budgetApi = {
  getAll: () => api.get("/budgets").then((res) => res.data),
  getByCategory: (categoryId) => api.get(`/budgets/category/${categoryId}`).then((res) => res.data),
  create: (data) => api.post("/budgets/create", data).then((res) => res.data),
  update: (id, data) => api.put(`/budgets/update/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/budgets/delete/${id}`).then((res) => res.data),
};
