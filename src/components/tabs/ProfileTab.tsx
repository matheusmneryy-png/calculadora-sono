import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

const ProfileTab = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Avatar card */}
      <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full sleep-gradient flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-bold text-lg text-foreground leading-tight">{user?.name}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" />
            {user?.email}
          </p>
        </div>
      </div>

      {/* Settings card */}
      <div className="glass-card rounded-2xl divide-y divide-border/50">
        {/* Theme toggle */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {theme === "dark"
              ? <Moon className="w-4 h-4 text-primary" />
              : <Sun className="w-4 h-4 text-amber-500" />
            }
            <div>
              <p className="text-sm font-medium text-foreground">Modo escuro</p>
              <p className="text-xs text-muted-foreground">Alternar tema da interface</p>
            </div>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 p-4">
          <User className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">Conta Ativa</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-500">
                Nuvem
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Sincronizado automaticamente</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 gap-2 rounded-xl h-11"
      >
        <LogOut className="w-4 h-4" />
        Sair da conta
      </Button>
    </motion.div>
  );
};

export default ProfileTab;
