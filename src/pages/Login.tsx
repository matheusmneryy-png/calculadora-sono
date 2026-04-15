import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Moon, Mail, Lock, User as UserIcon, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────
   Pure-CSS confetti – zero dependency on
   framer-motion for the falling animation
───────────────────────────────────────── */
const COLORS = [
  "#6366f1", "#a855f7", "#ec4899",
  "#f59e0b", "#10b981", "#3b82f6",
  "#ef4444", "#8b5cf6", "#06b6d4",
];

interface Piece {
  id: number;
  left: number;      // %
  delay: number;     // s
  duration: number;  // s
  color: string;
  w: number;         // px
  h: number;         // px
  borderRadius: string;
}

function makePieces(n: number): Piece[] {
  return Array.from({ length: n }, (_, i) => {
    const isRect = Math.random() > 0.4;
    const size = 4 + Math.random() * 7;
    return {
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,          // spread over 8 s
      duration: 5 + Math.random() * 6,   // 5–11 s per loop
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: isRect ? size * 2.2 : size,
      h: size,
      borderRadius: isRect ? "2px" : "50%",
    };
  });
}

const pieces = makePieces(90);

const ConfettiBg = () => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0,
    }}
  >
    {pieces.map((p) => (
      <div
        key={p.id}
        style={{
          position: "absolute",
          left: `${p.left}%`,
          top: 0,
          width: p.w,
          height: p.h,
          background: p.color,
          borderRadius: p.borderRadius,
          opacity: 0.85,
          animation: `confetti-fall ${p.duration}s ${p.delay}s linear infinite`,
        }}
      />
    ))}
  </div>
);

/* ─── Main Login component ─── */
const Login = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (mode === "register" && !name)) {
      setError("Preencha todos os campos.");
      return;
    }

    if (mode === "login") {
      if (login(email, password)) {
        navigate("/");
      } else {
        setError("E-mail ou senha incorretos.");
      }
    } else {
      const result = register(name, email, password);
      if (result.ok) {
        navigate("/");
      } else {
        setError(result.error ?? "Erro ao criar conta.");
      }
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div
      style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "1rem" }}
      className="bg-background"
    >
      {/* Confetti falling behind everything */}
      <ConfettiBg />

      {/* Card */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 380 }}
      >
        <div className="glass-card rounded-3xl p-8 space-y-7 shadow-2xl">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl sleep-gradient mb-2 shadow-lg shadow-primary/30">
              <Moon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">SleepCycle</h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Entre na sua conta" : "Crie sua conta gratuita"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                  className="relative"
                >
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder={mode === "register" ? "Senha (mín. 6 caracteres)" : "Senha"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-destructive text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full sleep-gradient hover:opacity-90 text-primary-foreground font-semibold h-11 shadow-md shadow-primary/20"
            >
              {mode === "login" ? "Entrar" : "Criar conta"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {mode === "login"
                ? "Não tem conta? Cadastre-se"
                : "Já tem conta? Entrar"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
