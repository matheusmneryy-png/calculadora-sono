import { motion } from "framer-motion";
import { Moon, TrendingUp, Clock, Zap, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const weekData = [
  { day: "Seg", hours: 6.5 },
  { day: "Ter", hours: 7.5 },
  { day: "Qua", hours: 5.0 },
  { day: "Qui", hours: 8.0 },
  { day: "Sex", hours: 7.0 },
  { day: "Sáb", hours: 9.0 },
  { day: "Dom", hours: 7.5 },
];

const stats = [
  { icon: Moon,      label: "Último sono",    value: "7h30", sub: "Ontem" },
  { icon: TrendingUp,label: "Média semanal",  value: "7h15", sub: "Bom" },
  { icon: Clock,     label: "Ciclos",         value: "5",    sub: "Completos" },
  { icon: Zap,       label: "Qualidade",      value: "85%",  sub: "Boa", accent: true },
];

const StatsTab = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-5"
  >
    <div>
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-primary" />
        Estatísticas de Sono
      </h2>
      <p className="text-xs text-muted-foreground">Resumo da sua última semana</p>
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-2xl p-4 space-y-2 transition-all ${
            s.accent ? "sleep-gradient text-primary-foreground shadow-lg" : "glass-card"
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

    {/* Weekly bar chart */}
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <h3 className="text-sm font-bold text-foreground">Horas dormidas por dia</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={weekData} barSize={28}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 10]} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
            formatter={(v: number) => [`${v}h`, "Horas"]}
          />
          <Bar dataKey="hours" radius={[6, 6, 2, 2]}>
            {weekData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.hours >= 7 ? "hsl(var(--primary))" : "hsl(var(--muted))"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[11px] text-muted-foreground text-center">
        Meta: 7h30 por noite · barras roxas = meta atingida
      </p>
    </div>
  </motion.div>
);

export default StatsTab;
