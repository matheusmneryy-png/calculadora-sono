import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Moon, Sunrise, ClipboardList, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  slept: string;
  woke: string;
  date: string;
  hours: number;
}

function calcHours(slept: string, woke: string): number {
  const [sh, sm] = slept.split(":").map(Number);
  const [wh, wm] = woke.split(":").map(Number);
  let diff = wh * 60 + wm - (sh * 60 + sm);
  if (diff < 0) diff += 1440;
  return Math.round((diff / 60) * 10) / 10;
}

const LogTab = () => {
  const [slept, setSlept] = useState("");
  const [woke, setWoke] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const handleSave = () => {
    if (!slept || !woke) {
      toast.error("Preencha os dois horários");
      return;
    }
    const hours = calcHours(slept, woke);
    const entry: LogEntry = {
      id: Date.now().toString(),
      slept,
      woke,
      hours,
      date: new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }),
    };
    setLogs((prev) => [entry, ...prev]);
    toast.success("Sono registrado! 🌙");
    setSlept("");
    setWoke("");
  };

  const handleDelete = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          Registrar Sono
        </h2>
        <p className="text-xs text-muted-foreground">Anote seu sono de ontem</p>
      </div>

      {/* Input form */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" /> Dormiu às
            </label>
            <Input
              type="time"
              value={slept}
              onChange={(e) => setSlept(e.target.value)}
              className="h-11 font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Sunrise className="w-3.5 h-3.5" /> Acordou às
            </label>
            <Input
              type="time"
              value={woke}
              onChange={(e) => setWoke(e.target.value)}
              className="h-11 font-mono"
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="w-full h-11 sleep-gradient text-primary-foreground hover:opacity-90 rounded-xl font-semibold gap-2"
        >
          <Plus className="w-4 h-4" />
          Salvar registro
        </Button>
      </div>

      {/* Log list */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Histórico
          </p>
          <AnimatePresence>
            {logs.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="glass-card rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl sleep-gradient flex items-center justify-center text-primary-foreground font-bold text-sm shadow">
                    {entry.hours}h
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {entry.slept} → {entry.woke}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {logs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ClipboardList className="w-10 h-10 mx-auto opacity-30 mb-2" />
          <p className="text-sm">Nenhum registro ainda.</p>
          <p className="text-xs opacity-60">Adicione seu primeiro sono acima.</p>
        </div>
      )}
    </motion.div>
  );
};

export default LogTab;
