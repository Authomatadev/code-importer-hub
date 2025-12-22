import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateRut, formatRut, cleanRut } from "@/lib/rut-validation";
import { Loader2 } from "lucide-react";

interface WaitingListEntry {
  id: string;
  rut: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  selected_distance: string | null;
  selected_difficulty: number | null;
}

interface EditWaitingEntryDialogProps {
  entry: WaitingListEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: {
    rut: string;
    first_name: string;
    last_name: string;
    selected_distance: string;
    selected_difficulty: number;
  }) => Promise<void>;
  isSaving: boolean;
}

export function EditWaitingEntryDialog({
  entry,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: EditWaitingEntryDialogProps) {
  const [rut, setRut] = useState(entry?.rut || "");
  const [firstName, setFirstName] = useState(entry?.first_name || "");
  const [lastName, setLastName] = useState(entry?.last_name || "");
  const [distance, setDistance] = useState(entry?.selected_distance || "");
  const [difficulty, setDifficulty] = useState<string>(
    entry?.selected_difficulty?.toString() || ""
  );
  const [rutError, setRutError] = useState("");

  // Reset form when entry changes
  useState(() => {
    if (entry) {
      setRut(entry.rut || "");
      setFirstName(entry.first_name || "");
      setLastName(entry.last_name || "");
      setDistance(entry.selected_distance || "");
      setDifficulty(entry.selected_difficulty?.toString() || "");
    }
  });

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value);
    setRut(formatted);
    if (formatted && !validateRut(formatted)) {
      setRutError("RUT inválido");
    } else {
      setRutError("");
    }
  };

  const handleSubmit = async () => {
    if (!entry) return;

    if (!validateRut(rut)) {
      setRutError("RUT inválido");
      return;
    }

    await onSave(entry.id, {
      rut: cleanRut(rut),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      selected_distance: distance,
      selected_difficulty: parseInt(difficulty),
    });
  };

  const isValid =
    rut &&
    validateRut(rut) &&
    firstName.trim() &&
    lastName.trim() &&
    distance &&
    difficulty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Completar datos del usuario</DialogTitle>
          <DialogDescription>
            Completa los datos faltantes para poder aprobar a {entry?.email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rut">RUT</Label>
            <Input
              id="rut"
              value={rut}
              onChange={(e) => handleRutChange(e.target.value)}
              placeholder="12.345.678-9"
            />
            {rutError && (
              <p className="text-sm text-destructive">{rutError}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Juan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Pérez"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="distance">Distancia</Label>
            <Select value={distance} onValueChange={setDistance}>
              <SelectTrigger id="distance">
                <SelectValue placeholder="Seleccionar distancia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10k">10K</SelectItem>
                <SelectItem value="21k">21K (Media Maratón)</SelectItem>
                <SelectItem value="42k">42K (Maratón)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="difficulty">Nivel</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Principiante</SelectItem>
                <SelectItem value="2">Intermedio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar y Aprobar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
