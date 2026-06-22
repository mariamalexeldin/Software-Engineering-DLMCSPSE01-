import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem("findly_user"));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("findly_token")));

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem("findly_user", JSON.stringify(data.user));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("findly_token")) refreshUser();
    else setLoading(false);

    const expire = () => setUser(null);
    window.addEventListener("auth-expired", expire);
    return () => window.removeEventListener("auth-expired", expire);
  }, []);

  const completeAuth = ({ token, user: authenticatedUser }) => {
    localStorage.setItem("findly_token", token);
    localStorage.setItem("findly_user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    completeAuth(data);
    return data.user;
  };

  const register = async (details) => {
    const { data } = await api.post("/auth/register", details);
    completeAuth(data);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("findly_token");
    localStorage.removeItem("findly_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAdmin: user?.role === "admin" }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

