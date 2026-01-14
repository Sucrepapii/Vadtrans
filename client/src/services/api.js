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

export default api;
