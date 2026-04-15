import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse supa user to our local User format
  const formatSupaUser = (u: SupabaseUser | null): User | null => {
    if (!u || !u.email) return null;
    return {
      email: u.email,
      name: u.user_metadata?.name || "Usuário"
    };
  };

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(formatSupaUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(formatSupaUser(session?.user ?? null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          return { ok: false, error: "Confirme seu e-mail (clique no link enviado) antes de entrar, ou desative a confirmação no Supabase." };
        }
        return { ok: false, error: "E-mail ou senha incorretos." };
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      if (!name.trim() || !email.trim() || !password.trim()) {
        return { ok: false, error: "Preencha todos os campos." };
      }
      if (password.length < 6) {
        return { ok: false, error: "A senha deve ter pelo menos 6 caracteres." };
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name.trim()
            }
          }
        });

        if (error) {
          if (error.message.includes("already registered")) {
            return { ok: false, error: "Este e-mail já está cadastrado." };
          }
          return { ok: false, error: error.message };
        }

        if (!data.session) {
          return { 
            ok: false, 
            error: "Conta criada! Por favor, acesse seu e-mail e clique no link de confirmação para poder entrar (Se não quiser isso, desative o 'Confirm Email' no Supabase)." 
          };
        }

        return { ok: true };
      } catch (err: any) {
        return { ok: false, error: err.message };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {/* Show nothing or a global loader while initially checking session */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
