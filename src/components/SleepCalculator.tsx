import { useState } from "react";
import { Clock, Sunrise, Moon as MoonIcon, AlertTriangle, Info, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 15;

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = ((h * 60 + m + minutes) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function subtractMinutes(time: string, minutes: number): string {
  return addMinutes(time, -minutes);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getDayLabel(calculatedTime: string, _referenceTime: string, mode: "wake" | "sleep"): string {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const calcMin = timeToMinutes(calculatedTime);

  if (mode === "sleep") {
    // wake-up time relative to a user-given sleep time
    return calcMin < nowMin - 30 ? "Amanhã" : "Hoje";
  }
  return calcMin < nowMin - 30 ? "Amanhã" : "Hoje";
}

type WellnessLevel = {
  emoji: string;
  label: string;
  effect: string;
  colorClass: string;
};

function getWellness(cycles: number): WellnessLevel {
  if (cycles <= 0) return { emoji: "❌", label: "Impossível", effect: "Sem tempo suficiente", colorClass: "wellness-danger" };
  if (cycles <= 2) return { emoji: "⚠️", label: "Muito baixo", effect: "Sono insuficiente", colorClass: "wellness-danger" };
  if (cycles === 3) return { emoji: "🔴", label: "Baixo", effect: "Apenas emergências", colorClass: "wellness-danger" };
  if (cycles === 4) return { emoji: "🟡", label: "Regular", effect: "Funcional", colorClass: "wellness-warning" };
  if (cycles === 5) return { emoji: "🟢", label: "Bom", effect: "Ideal", colorClass: "wellness-good" };
  if (cycles === 6) return { emoji: "🟢", label: "Muito bom", effect: "Excelente", colorClass: "wellness-good" };
  if (cycles <= 8) return { emoji: "🟡", label: "Excesso", effect: "Inércia do sono", colorClass: "wellness-warning" };
  return { emoji: "🔴", label: "Excesso severo", effect: "Não recomendado", colorClass: "wellness-danger" };
}

interface ResultCardProps {
  cycles: number;
  time: string;
  sleepHours: string;
  totalHours: string;
  recommended?: boolean;
  dayLabel: string;
  onSetReminder?: () => void;
}

const ResultCard = ({ cycles, time, sleepHours, recommended, dayLabel, onSetReminder }: ResultCardProps) => {
  const wellness = getWellness(cycles);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`flex-shrink-0 w-52 p-4 rounded-2xl border transition-all snap-start cursor-default ${
        recommended
          ? "border-primary/50 bg-primary/8 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
          : "border-border/60 bg-card/70 hover:border-border"
      }`}
    >
      <div className="space-y-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">{time}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{dayLabel}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 font-medium">
            {cycles} {cycles === 1 ? "ciclo" : "ciclos"}
          </span>
          <span>{sleepHours}</span>
        </div>

        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${wellness.colorClass}`}>
          <span className="text-sm">{wellness.emoji}</span>
          <div>
            <span className="font-semibold">{wellness.label}</span>
            <span className="opacity-70 ml-1">· {wellness.effect}</span>
          </div>
        </div>

        {recommended && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
            ★ Recomendado
          </span>
        )}

        {onSetReminder && (
          <button
            onClick={onSetReminder}
            className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors pt-1"
          >
            <Bell className="w-3 h-3" />
            Lembrete
          </button>
        )}
      </div>
    </motion.div>
  );
};

const InfoTooltip = ({ text }: { text: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help inline-block ml-1 hover:text-muted-foreground transition-colors" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[250px] text-xs leading-relaxed">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const SleepDebtSection = () => {
  const [lastNightHours, setLastNightHours] = useState("");
  const ideal = 7.5;
  const slept = parseFloat(lastNightHours);
  const debt = !isNaN(slept) ? Math.max(0, ideal - slept) : null;

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-1">
        💤 Débito de sono
        <InfoTooltip text="Informe quantas horas dormiu ontem. Se for menos que 7h30, calcularemos quanto sono extra você precisa." />
      </h3>
      <div className="flex items-center gap-3">
        <Input
          type="number"
          step="0.5"
          min="0"
          max="24"
          placeholder="Ex: 5.5"
          value={lastNightHours}
          onChange={(e) => setLastNightHours(e.target.value)}
          className="w-24 text-sm text-center"
        />
        <span className="text-xs text-muted-foreground">horas dormidas ontem</span>
      </div>
      <AnimatePresence>
        {debt !== null && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm">
            {debt > 0 ? (
              <div className="wellness-warning px-3 py-2 rounded-lg">
                ⚠️ Débito de <strong>{formatDuration(debt * 60)}</strong>. Tente dormir{" "}
                <strong>{formatDuration((ideal + Math.min(debt, 2)) * 60)}</strong> hoje.
              </div>
            ) : (
              <div className="wellness-good px-3 py-2 rounded-lg">
                ✅ Sem débito de sono! Você dormiu o suficiente.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SleepCalculator = () => {
  const [wakeTime, setWakeTime] = useState("");
  const [sleepTime, setSleepTime] = useState("");

  // ── Feature 1: "Que horas deseja acordar?" ────────────────────────────────
  //
  // Lógica correta:
  //   1. Pega o horário ATUAL do dispositivo do usuário (timezone local)
  //   2. Adiciona 15 min → horário em que vai pegar no sono
  //   3. Calcula quantos minutos restam entre "adormecer" e o horário desejado
  //   4. Divide por 90 e arredonda para baixo → ciclos completos disponíveis
  //
  // Ex: agora = 15h30, quer acordar 20h00
  //   adormecer = 15h45
  //   disponível = 20h00 - 15h45 = 4h15 = 255 min
  //   ciclos = ⌊255/90⌋ = 2 ciclos (3h de sono real)
  //
  const wakeAnalysis = (() => {
    if (!wakeTime) return null;

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    // Horário em que o usuário pegaria no sono (+15 min a partir de agora)
    const fallAsleepMin = (nowMin + FALL_ASLEEP_MINUTES) % 1440;
    const fallAsleepStr = `${String(Math.floor(fallAsleepMin / 60)).padStart(2, "0")}:${String(fallAsleepMin % 60).padStart(2, "0")}`;

    // Janela disponível entre adormecer e acordar
    const wakeMin = timeToMinutes(wakeTime);
    let available = wakeMin - fallAsleepMin;
    if (available <= 0) available += 1440; // horário passa de meia-noite

    // Ciclos completos de 90 min que cabem nessa janela
    const completeCycles = Math.floor(available / CYCLE_MINUTES);

    // Horários ideais (calculados de trás p/ frente a partir do wake time)
    const idealSleep5 = subtractMinutes(wakeTime, 5 * CYCLE_MINUTES + FALL_ASLEEP_MINUTES);
    const idealSleep6 = subtractMinutes(wakeTime, 6 * CYCLE_MINUTES + FALL_ASLEEP_MINUTES);

    return { completeCycles, fallAsleepStr, idealSleep5, idealSleep6 };
  })();

  // ── Feature 2: "Que horas deseja dormir?" ─────────────────────────────────
  // Usuário informa quando vai dormir → calculamos os horários para acordar
  // após 3, 4, 5 e 6 ciclos completos (+ 15 min de latência do sono).
  const sleepResults = sleepTime
    ? [3, 4, 5, 6].map((cycles) => {
        const time = addMinutes(sleepTime, FALL_ASLEEP_MINUTES + cycles * CYCLE_MINUTES);
        return {
          cycles,
          time,
          sleepHours: formatDuration(cycles * CYCLE_MINUTES),
          totalHours: formatDuration(cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES),
          dayLabel: getDayLabel(time, sleepTime, "sleep"),
        };
      })
    : [];

  const handleSetReminder = (time: string, dayLabel: string) => {
    toast.success(`⏰ Lembrete: ${dayLabel} às ${time}`, {
      description: "Você será notificado (simulado).",
    });
  };

  // Horário atual formatado (auto-atualiza ao remontar)
  const nowLabel = (() => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
  })();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Calculadora de Sono</h2>
        <p className="text-xs text-muted-foreground">Planeje seus ciclos para acordar revigorado</p>
      </div>

      {/* ─── Feature 1 ─── */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl sleep-gradient flex items-center justify-center shadow-md">
            <Sunrise className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm flex items-center">
              Que horas deseja acordar?
              <InfoTooltip text="Com base no horário atual do seu dispositivo, calculamos quantos ciclos completos de 90 min você terá dormindo AGORA (+ 15 min para adormecer) até a hora que inseriu." />
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Agora são{" "}
              <span className="font-mono font-semibold text-foreground">{nowLabel}</span>
              {" "}· horário local
            </p>
          </div>
        </div>

        <Input
          type="time"
          value={wakeTime}
          onChange={(e) => setWakeTime(e.target.value)}
          className="text-lg font-mono h-12"
        />

        <AnimatePresence>
          {wakeAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Resultado principal */}
              <div
                className={`rounded-2xl p-4 ${
                  wakeAnalysis.completeCycles >= 5
                    ? "sleep-gradient text-primary-foreground"
                    : wakeAnalysis.completeCycles >= 4
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-70 mb-1">
                      Dormindo às {wakeAnalysis.fallAsleepStr} (agora + 15 min)
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold leading-none">
                        {wakeAnalysis.completeCycles}
                      </span>
                      <span className="text-xl font-semibold opacity-80">
                        {wakeAnalysis.completeCycles === 1 ? "ciclo" : "ciclos"}
                      </span>
                    </div>
                    <p className="text-sm opacity-75 mt-1">
                      {formatDuration(wakeAnalysis.completeCycles * CYCLE_MINUTES)} de sono real
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] opacity-60">Acorda às</p>
                    <p className="text-2xl font-extrabold font-mono">{wakeTime}</p>
                    {(() => {
                      const w = getWellness(wakeAnalysis.completeCycles);
                      return (
                        <p className="text-sm mt-1">
                          {w.emoji} {w.label}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Dica quando os ciclos são poucos */}
              {wakeAnalysis.completeCycles < 5 && (
                <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/50 rounded-xl p-3">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                  <p>
                    Para 5 ciclos ideais (7h30), durma às{" "}
                    <strong className="text-foreground">{wakeAnalysis.idealSleep5}</strong>.{" "}
                    Para 6 ciclos (9h), às{" "}
                    <strong className="text-foreground">{wakeAnalysis.idealSleep6}</strong>.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Feature 2 ─── */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-md">
            <MoonIcon className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm flex items-center">
              Que horas deseja dormir?
              <InfoTooltip text="Insira o horário em que pretende dormir. Mostraremos os despertadores ideais após 3, 4, 5 ou 6 ciclos completos (já incluídos 15 min para adormecer)." />
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Horários ideais para acordar · 3–6 ciclos
            </p>
          </div>
        </div>

        <Input
          type="time"
          value={sleepTime}
          onChange={(e) => setSleepTime(e.target.value)}
          className="text-lg font-mono h-12"
        />

        <AnimatePresence>
          {sleepResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" /> Deslize para ver os horários
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1 scrollbar-thin">
                {sleepResults.map((r) => (
                  <ResultCard
                    key={r.cycles}
                    {...r}
                    recommended={r.cycles === 5 || r.cycles === 6}
                    onSetReminder={() => handleSetReminder(r.time, r.dayLabel)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Débito de sono */}
      <SleepDebtSection />
    </div>
  );
};

export default SleepCalculator;
