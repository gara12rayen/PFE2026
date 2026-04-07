import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // ── On mount: restore session from localStorage ────────
  useEffect(() => {
    const token = localStorage.getItem("tf_token");
    const stored = localStorage.getItem("tf_user");
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("tf_user");
      }
      // Verify token is still valid with the server
      authAPI.me()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("tf_user", JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem("tf_token");
          localStorage.removeItem("tf_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem("tf_token", access_token);
    localStorage.setItem("tf_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem("tf_user", JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
