import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Settings } from "lucide-react";
import SleepCalculator from "@/components/SleepCalculator";
import LogTab from "@/components/tabs/LogTab";
import StatsTab from "@/components/tabs/StatsTab";
import ProfileTab from "@/components/tabs/ProfileTab";
import BottomNav, { TabId } from "@/components/BottomNav";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 6)  return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const tabTitles: Record<TabId, string> = {
  calc:    "Calculadora de Sono",
  log:     "Registrar Sono",
  stats:   "Estatísticas",
  profile: "Meu Perfil",
};

const Dashboard = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("calc");

  return (
    /* Full-viewport flex column – NO page scroll */
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }} className="bg-background">

      {/* ── Header ── */}
      <header className="flex-shrink-0 backdrop-blur-md bg-background/80 border-b border-border/50 z-40">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          {/* Title */}
          <div>
            <h1 className="text-sm font-bold text-foreground leading-none">{tabTitles[activeTab]}</h1>
            <p className="text-[10px] text-muted-foreground">{greeting()}, {user?.name?.split(" ")[0]} ✨</p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full sleep-gradient flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md cursor-pointer"
              onClick={() => setActiveTab("profile")}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* ── Scrollable tab content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 pb-6">
          <AnimatePresence mode="wait">
            {activeTab === "calc" && (
              <motion.div
                key="calc"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <SleepCalculator />
              </motion.div>
            )}
            {activeTab === "log" && (
              <motion.div
                key="log"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <LogTab />
              </motion.div>
            )}
            {activeTab === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <StatsTab />
              </motion.div>
            )}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ProfileTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Bottom Nav ── */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;
