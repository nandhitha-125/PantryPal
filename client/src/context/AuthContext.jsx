import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContextDef";
import { API } from "../utils/api";

const API_BASE = API.AUTH;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("pantrypal_token"));
  const [loading, setLoading] = useState(true);

  // Declare logout BEFORE the useEffect that references it
  const logout = useCallback(() => {
    localStorage.removeItem("pantrypal_token");
    setToken(null);
    setUser(null);
  }, []);

  // On mount, verify token
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token, logout]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem("pantrypal_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, mobile, password, gender = "girl") => {
    let res;
    try {
      res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, password, gender }),
      });
    } catch {
      throw new Error("Unable to connect to the server. Please check if the server is running.");
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem("pantrypal_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const updateProfile = async (profileData) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error("Failed to update profile on server:", err);
    }
    // Optimistic fallback update for offline or mock state
    setUser((prev) => ({ ...prev, ...profileData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
