import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: We check both sessionStorage (new standard) and localStorage (legacy migration)
    const storedUserStr =
      sessionStorage.getItem("vadtrans_user") ||
      localStorage.getItem("vadtrans_user");

    if (storedUserStr) {
      try {
        const parsedUser = JSON.parse(storedUserStr);
        setUser(parsedUser);

        // Migrate legacy localStorage users to sessionStorage on load
        if (localStorage.getItem("vadtrans_user")) {
          sessionStorage.setItem("vadtrans_user", storedUserStr);
          localStorage.removeItem("vadtrans_user");
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        sessionStorage.removeItem("vadtrans_user");
        localStorage.removeItem("vadtrans_user");
      }
    }
    setLoading(false);
  }, []);

  // 5-minute inactivity timeout
  useEffect(() => {
    let timeoutId;
    const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

    const handleActivity = () => {
      clearTimeout(timeoutId);
      if (user) {
        timeoutId = setTimeout(() => {
          logout();
          // Optional: Could redirect or show a toast here, but logout() clears state
          window.location.href = "/login?timeout=true";
        }, INACTIVITY_LIMIT);
      }
    };

    // Only set up listeners if user is logged in
    if (user) {
      handleActivity(); // Start initial timer

      const events = [
        "mousemove",
        "keydown",
        "scroll",
        "mousedown",
        "touchstart",
      ];
      events.forEach((event) => window.addEventListener(event, handleActivity));

      return () => {
        clearTimeout(timeoutId);
        events.forEach((event) =>
          window.removeEventListener(event, handleActivity),
        );
      };
    }
  }, [user]);

  const login = (userData) => {
    // Use role from backend user data
    const userWithRole = { ...userData };
    setUser(userWithRole);
    sessionStorage.setItem("vadtrans_user", JSON.stringify(userWithRole));
    return userWithRole.role; // Return role for backward compatibility
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("vadtrans_user");
    sessionStorage.removeItem("token");
    localStorage.removeItem("vadtrans_user");
    localStorage.removeItem("token");
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    sessionStorage.setItem("vadtrans_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isCompany: user?.role === "company",
    isTraveler: user?.role === "traveler",
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
