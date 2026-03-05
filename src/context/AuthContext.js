import React, { createContext, useState, useEffect } from "react";

// Create the Context object
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // RS1: Persistence - Check localStorage on initial load
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("activeSession");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Sync state with localStorage whenever the user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("activeSession", JSON.stringify(user));
    } else {
      localStorage.removeItem("activeSession");
    }
  }, [user]);

  // Function to log in (Expected by Login.js)
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // Function to log out (Expected by App.js/Header)
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};