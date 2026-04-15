import { Moon, TrendingUp, Clock, Zap } from "lucide-react";

const stats = [
  { icon: Moon, label: "Último sono", value: "7h30", sub: "Ontem", accent: false },
  { icon: TrendingUp, label: "Média semanal", value: "7h15", sub: "Bom", accent: false },
  { icon: Clock, label: "Ciclos", value: "5", sub: "Completos", accent: false },
  { icon: Zap, label: "Qualidade", value: "85%", sub: "Boa", accent: true },
];

const SleepStats = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {stats.map((s) => (
      <div
        key={s.label}
        className={`rounded-2xl p-4 space-y-2 transition-all ${
          s.accent
            ? "sleep-gradient text-primary-foreground shadow-lg"
            : "glass-card"
        }`}
      >
        <div className="flex items-center gap-2">
          <s.icon className={`w-4 h-4 ${s.accent ? "text-primary-foreground/80" : "text-primary"}`} />
          <span className={`text-[11px] font-medium ${s.accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {s.label}
          </span>
        </div>
        <p className={`text-2xl font-bold leading-none ${s.accent ? "" : "text-foreground"}`}>{s.value}</p>
        <p className={`text-[10px] ${s.accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{s.sub}</p>
      </div>
    ))}
  </div>
);

export default SleepStats;
