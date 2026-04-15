import { Moon, BarChart2, ClipboardList, User } from "lucide-react";

export type TabId = "calc" | "log" | "stats" | "profile";

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "calc",    label: "Calcular",     Icon: Moon },
  { id: "log",     label: "Registrar",    Icon: ClipboardList },
  { id: "stats",   label: "Estatísticas", Icon: BarChart2 },
  { id: "profile", label: "Perfil",       Icon: User },
];

const BottomNav = ({ active, onChange }: BottomNavProps) => (
  <nav className="flex-shrink-0 border-t border-border/50 bg-background/90 backdrop-blur-md">
    <div className="flex items-stretch max-w-2xl mx-auto">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2.5 text-[10px] font-medium transition-all ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
            />
            <span>{label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-primary absolute bottom-2" />
            )}
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
