import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const STORAGE_KEY = "examplatform.auth";
const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredSession();
    if (!stored) {
      setReady(true);
      return;
    }

    setToken(stored.token);
    setUser(stored.user || null);
    setReady(true);

    if (stored.token) {
      api("/user", { token: stored.token })
        .then((freshUser) => {
          setUser(freshUser);
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ token: stored.token, user: freshUser }),
          );
        })
        .catch(() => {
          window.localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  function persist(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: nextToken, user: nextUser }),
    );
  }

  async function login(email, password) {
    const data = await api("/login", {
      method: "POST",
      body: { email, password },
    });
    persist(data.token, data.user);
    return data;
  }

  async function register(name, email, password, passwordConfirmation) {
    const data = await api("/register", {
      method: "POST",
      body: {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      },
    });
    persist(data.token, data.user);
    return data;
  }

  async function completeOAuth(code) {
    const data = await api("/auth/oauth/exchange", {
      method: "POST",
      body: { code },
    });
    persist(data.token, data.user);
    return data;
  }

  async function updateProfile(payload) {
    const data = await api("/profile", {
      method: "PATCH",
      token,
      body: payload,
    });
    const nextUser = data?.user || data;
    setUser(nextUser);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, user: nextUser }),
    );
    return nextUser;
  }

  async function logout() {
    const currentToken = token;
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
    if (currentToken) {
      try {
        await api("/logout", { method: "POST", token: currentToken });
      } catch {
        // The local session is already cleared; a failed server logout must not
        // keep the user stuck in the UI.
      }
    }
  }

  const value = useMemo(
    () => ({
      token,
      user,
      ready,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === "admin",
      login,
      register,
      completeOAuth,
      updateProfile,
      logout,
    }),
    [token, user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
