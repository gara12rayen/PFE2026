import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("tf_token");
      localStorage.removeItem("tf_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  login:          (data) => api.post("/api/auth/login", data),
  register:       (data) => api.post("/api/auth/register", data),
  me:             ()     => api.get("/api/auth/me"),
  updateMe:       (data) => api.patch("/api/auth/me", data),
  changePassword: (data) => api.post("/api/auth/me/change-password", data),
};

export const offersAPI = {
  list:   (params)   => api.get("/api/offers", { params }),
  get:    (id)       => api.get(`/api/offers/${id}`),
  create: (data)     => api.post("/api/offers", data),
  update: (id, data) => api.patch(`/api/offers/${id}`, data),
  delete: (id)       => api.delete(`/api/offers/${id}`),
};

export const applicationsAPI = {
  apply:        (formData) => api.post("/api/applications", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  mine:         ()         => api.get("/api/applications/mine"),
  list:         (params)   => api.get("/api/applications", { params }),
  get:          (id)       => api.get(`/api/applications/${id}`),
  updateStatus: (id, data) => api.patch(`/api/applications/${id}/status`, data),
  cvUrl:        (id)       => `http://localhost:8000/api/applications/${id}/cv`,
};

export const notificationsAPI = {
  list:        ()   => api.get("/api/notifications"),
  markRead:    (id) => api.patch(`/api/notifications/${id}/read`),
  markAllRead: ()   => api.post("/api/notifications/read-all"),
};

export const adminAPI = {
  listUsers:  ()     => api.get("/api/admin/users"),
  createUser: (data) => api.post("/api/admin/users", data),
  toggleUser: (id)   => api.patch(`/api/admin/users/${id}/toggle`),
  stats:      ()     => api.get("/api/admin/stats"),
};

export const settingsAPI = {
  get:    ()     => api.get("/api/settings"),
  update: (data) => api.patch("/api/settings", data),
};

export const calAPI = {
  bookings: () => api.get("/api/cal/bookings"),
};
