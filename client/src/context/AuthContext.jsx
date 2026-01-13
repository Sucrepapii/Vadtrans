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
    const storedUser = localStorage.getItem("vadtrans_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("vadtrans_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Use role from backend user data
    const userWithRole = { ...userData };
    setUser(userWithRole);
    localStorage.setItem("vadtrans_user", JSON.stringify(userWithRole));
    return userWithRole.role; // Return role for backward compatibility
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vadtrans_user");
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("vadtrans_user", JSON.stringify(updatedUser));
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
