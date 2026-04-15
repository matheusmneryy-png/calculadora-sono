import React, { createContext, useContext, useState, useCallback } from "react";

interface User {
  email: string;
  name: string;
}

interface StoredUser {
  email: string;
  name: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const DB_KEY = "sleep_users_db";
const SESSION_KEY = "sleep_user";

function getUsersDb(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsersDb(users: StoredUser[]) {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email: string, password: string): boolean => {
    const db = getUsersDb();
    const found = db.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      const sessionUser: User = { email: found.email, name: found.name };
      setUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return true;
    }
    return false;
  }, []);

  const register = useCallback(
    (name: string, email: string, password: string): { ok: boolean; error?: string } => {
      if (!name.trim() || !email.trim() || !password.trim()) {
        return { ok: false, error: "Preencha todos os campos." };
      }
      if (password.length < 6) {
        return { ok: false, error: "A senha deve ter pelo menos 6 caracteres." };
      }
      const db = getUsersDb();
      const exists = db.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return { ok: false, error: "Este e-mail já está cadastrado." };
      }
      const newUser: StoredUser = { email: email.trim(), name: name.trim(), password };
      saveUsersDb([...db, newUser]);

      const sessionUser: User = { email: newUser.email, name: newUser.name };
      setUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
