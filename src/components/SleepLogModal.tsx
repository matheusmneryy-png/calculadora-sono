import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Moon, Sunrise } from "lucide-react";
import { toast } from "sonner";

const SleepLogModal = () => {
  const [slept, setSlept] = useState("");
  const [woke, setWoke] = useState("");
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (!slept || !woke) {
      toast.error("Preencha os dois horários");
      return;
    }
    toast.success("Sono registrado com sucesso! 🌙");
    setOpen(false);
    setSlept("");
    setWoke("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-12 sleep-gradient text-primary-foreground hover:opacity-90 gap-2 rounded-2xl shadow-lg shadow-primary/10 text-sm font-semibold">
          <Plus className="w-4 h-4" /> Registrar Sono
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Registrar Sono</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" /> Hora que dormiu
            </label>
            <Input type="time" value={slept} onChange={(e) => setSlept(e.target.value)} className="h-11 font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Sunrise className="w-3.5 h-3.5" /> Hora que acordou
            </label>
            <Input type="time" value={woke} onChange={(e) => setWoke(e.target.value)} className="h-11 font-mono" />
          </div>
          <Button onClick={handleSave} className="w-full h-11 sleep-gradient text-primary-foreground hover:opacity-90 rounded-xl font-semibold">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SleepLogModal;
