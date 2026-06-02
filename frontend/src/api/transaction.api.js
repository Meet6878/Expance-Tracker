import api from "./axios";

export const transactionApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });
    return api.get(`/transactions?${params.toString()}`).then((res) => res.data);
  },

  create: (data) =>
    api.post("/transactions/create", data).then((res) => res.data),

  update: (id, data) =>
    api.put(`/transactions/update/${id}`, data).then((res) => res.data),

  delete: (id) =>
    api.delete(`/transactions/delete/${id}`).then((res) => res.data),
};
