import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn(
    "⚠️ Production build but VITE_API_URL is not set. API calls may fail.",
  );
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable credentials for CORS
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // Check sessionStorage first, fallback to localStorage for legacy sessions
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post("/auth/signup", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  verifyEmail: (token) => api.post("/auth/verify-email", { token }),
  resendVerification: (email) =>
    api.post("/auth/resend-verification", { email }),

  // Document upload
  uploadDocument: (formData) =>
    api.post("/auth/upload-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
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
  updateLocation: (id, data) => api.put(`/trips/${id}/location`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
};

// Booking API
export const bookingAPI = {
  createBooking: (bookingData) => api.post("/bookings", bookingData),
  getUserBookings: () => api.get("/bookings"),
  getCompanyBookings: () => api.get("/bookings/company/my-bookings"),
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
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Fare Management
  getFares: () => api.get("/admin/fares"),
  createFare: (data) => api.post("/admin/fares", data),
  updateFare: (id, data) => api.put(`/admin/fares/${id}`, data),
  deleteFare: (id) => api.delete(`/admin/fares/${id}`),

  // Company Management
  getCompanies: (params) => api.get("/admin/companies", { params }),
  approveCompany: (id, comment) => api.put(`/admin/companies/${id}/approve`, { comment }),
  rejectCompany: (id, comment) => api.put(`/admin/companies/${id}/reject`, { comment }),

  // Notifications
  getNotifications: () => api.get("/admin/notifications"),
  markNotificationRead: (id) => api.put(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put("/admin/notifications/read-all"),
};

// Contact API
export const contactAPI = {
  sendMessage: (data) => api.post("/contact", data),
};

// FAQ API
export const faqAPI = {
  getFAQs: () => api.get("/faqs"),

  // Admin
  getAllFAQsAdmin: () => api.get("/faqs/admin"),
  createFAQ: (data) => api.post("/faqs/admin", data),
  updateFAQ: (id, data) => api.put(`/faqs/admin/${id}`, data),
  deleteFAQ: (id) => api.delete(`/faqs/admin/${id}`),
};

// Review API
export const reviewAPI = {
  createReview: (data) => api.post("/reviews", data),
  getReviews: () => api.get("/reviews"),
  likeReview: (id) => api.put(`/reviews/${id}/like`),
};

// Shipment API
export const shipmentAPI = {
  createShipment: (data) => api.post("/shipments", data),
  getShipment: (trackingId) => api.get(`/shipments/track/${trackingId}`),
  getMyShipments: () => api.get("/shipments/me"),
  getCompanyShipments: () => api.get("/shipments/company"),
  getAllShipments: (params) => api.get("/shipments/admin", { params }),
  updateShipmentStatus: (id, data) => api.put(`/shipments/${id}/status`, data),
  verifyPayment: (data) => api.post("/shipments/verify-payment", data),
};

export default api;
