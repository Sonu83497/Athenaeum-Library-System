import api from "./api";

export const authApi = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
};

export const booksApi = {
  list: (params) => api.get("/api/books", { params }),
  get: (id) => api.get(`/api/books/${id}`),
  create: (data) => api.post("/api/books", data),
  update: (id, data) => api.put(`/api/books/${id}`, data),
  remove: (id) => api.delete(`/api/books/${id}`),
};

export const membersApi = {
  list: (params) => api.get("/api/members", { params }),
  me: () => api.get("/api/members/me"),
  get: (id) => api.get(`/api/members/${id}`),
  update: (id, data) => api.put(`/api/members/${id}`, data),
};

export const borrowApi = {
  issue: (data) => api.post("/api/borrow", data),
  return: (transactionId) => api.post(`/api/borrow/${transactionId}/return`),
  listAll: () => api.get("/api/borrow"),
  mine: () => api.get("/api/borrow/my"),
};

export const finesApi = {
  list: () => api.get("/api/fines"),
  mine: () => api.get("/api/fines/my"),
  pay: (fineId) => api.put(`/api/fines/${fineId}/pay`),
};

export const reportsApi = {
  dashboard: () => api.get("/api/reports/dashboard"),
  borrowingTrend: (months) => api.get("/api/reports/borrowing", { params: { months } }),
  overdue: () => api.get("/api/reports/overdue"),
  popularBooks: () => api.get("/api/reports/popular-books"),
  popularCategories: () => api.get("/api/reports/popular-categories"),
};

export const feedbackApi = {
  submit: (data) => api.post("/api/feedback", data),
  list: () => api.get("/api/feedback"),
  review: (id) => api.put(`/api/feedback/${id}/review`),
  remove: (id) => api.delete(`/api/feedback/${id}`),
};

export const notificationsApi = {
  list: (unreadOnly) => api.get("/api/notifications", { params: { unread_only: unreadOnly } }),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
};

export const chatApi = {
  send: (message) => api.post("/api/chat", { message }),
};
