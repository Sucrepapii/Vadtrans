import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post("/auth/signup", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),

  // Document upload
  uploadDocument: (file, documentType) => {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", documentType);

    return api.post("/auth/upload-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteDocument: (documentType) =>
    api.delete(`/auth/documents/${documentType}`),
};

// Trip API
export const tripAPI = {
  // Public endpoints
  getAllTrips: (params) => api.get("/trips", { params }),
  getTrip: (id) => api.get(`/trips/${id}`),
  searchTrips: (params) => api.get("/trips", { params }),

  // Company endpoints (protected)
  getMyTrips: () => api.get("/trips/company/my-trips"),
  createTrip: (tripData) => api.post("/trips", tripData),
  updateTrip: (id, tripData) => api.put(`/trips/${id}`, tripData),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
};

// Booking API
export const bookingAPI = {
  createBooking: (bookingData) => api.post("/bookings", bookingData),
  getUserBookings: () => api.get("/bookings"),
  getBooking: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getStats: () => api.get("/admin/stats"),
  getTopCompanies: (limit) =>
    api.get("/admin/top-companies", { params: { limit } }),

  // Trip Management
  getAllTrips: (params) => api.get("/admin/trips", { params }),
  updateTrip: (id, data) => api.put(`/admin/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/admin/trips/${id}`),

  // Booking Management
  getAllBookings: (params) => api.get("/admin/bookings", { params }),
  updateBooking: (id, status) => api.put(`/admin/bookings/${id}`, { status }),

  // User Management
  getAllUsers: (params) => api.get("/admin/users", { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),

  // Fare Management
  getFares: () => api.get("/admin/fares"),
  createFare: (data) => api.post("/admin/fares", data),
  updateFare: (id, data) => api.put(`/admin/fares/${id}`, data),
  deleteFare: (id) => api.delete(`/admin/fares/${id}`),

  // Company Management
  getCompanies: (params) => api.get("/admin/companies", { params }),
  approveCompany: (id) => api.put(`/admin/companies/${id}/approve`),
  rejectCompany: (id) => api.put(`/admin/companies/${id}/reject`),
};

export default api;
