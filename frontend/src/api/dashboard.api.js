import api from "./axios";

export const dashboardApi = {
  getStats: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    return api.get(`/dashboard?${params.toString()}`).then((res) => res.data);
  },
};
