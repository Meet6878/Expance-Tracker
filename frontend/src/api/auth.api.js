import api from "./axios";

export const authApi = {
  login: (data) => api.post("/auth/login", data).then((res) => res.data),
  register: (data) => api.post("/auth/register", data).then((res) => res.data),
  logout: () => api.post("/auth/logout").then((res) => res.data),
  getMe: () => api.get("/auth/me").then((res) => res.data),
};
