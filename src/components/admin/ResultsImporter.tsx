import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Upload,
  Plus,
  Trash2,
  FileSpreadsheet,
  Trophy,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type MarathonResult = Tables<"marathon_results">;

interface NewResult {
  position: number;
  first_name: string;
  last_name: string;
  dorsal: string;
  time_net: string;
  time_gross: string;
  distance: string;
  category: string;
  nationality: string;
  race_name: string;
  race_date: string;
}

const EMPTY_RESULT: NewResult = {
  position: 0,
  first_name: "",
  last_name: "",
  dorsal: "",
  time_net: "",
  time_gross: "",
  distance: "42k",
  category: "",
  nationality: "CHL",
  race_name: "Maratón de Santiago 2026",
  race_date: "2026-04-26",
};

export function ResultsImporter() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newResult, setNewResult] = useState<NewResult>(EMPTY_RESULT);
  const [csvData, setCsvData] = useState("");
  const [importMode, setImportMode] = useState<"manual" | "csv">("manual");
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  // Fetch existing results
  const { data: results, isLoading } = useQuery({
    queryKey: ["admin-marathon-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marathon_results")
        .select("*")
        .order("position", { ascending: true })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  // Add single result mutation
  const addResultMutation = useMutation({
    mutationFn: async (result: NewResult) => {
      const { error } = await supabase.from("marathon_results").insert([result]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-marathon-results"] });
      toast({
        title: "Resultado agregado",
        description: "El resultado se ha guardado correctamente.",
      });
      setNewResult(EMPTY_RESULT);
      setIsAddOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo agregar: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Import CSV mutation
  const importCsvMutation = useMutation({
    mutationFn: async (results: NewResult[]) => {
      const { error } = await supabase.from("marathon_results").insert(results);
      if (error) throw error;
      return results.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin-marathon-results"] });
      toast({
        title: "Importación exitosa",
        description: `Se importaron ${count} resultados correctamente.`,
      });
      setCsvData("");
      setParseErrors([]);
    },
    onError: (error) => {
      toast({
        title: "Error de importación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete result mutation
  const deleteResultMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("marathon_results")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-marathon-results"] });
      toast({
        title: "Resultado eliminado",
        description: "El resultado se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Parse CSV data
  const parseCSV = () => {
    const lines = csvData.trim().split("\n");
    const errors: string[] = [];
    const results: NewResult[] = [];

    // Expected format: position,first_name,last_name,dorsal,time_net,time_gross,distance,category,nationality
    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes("position")) {
        // Skip header row
        return;
      }

      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 6) {
        errors.push(`Línea ${index + 1}: Faltan campos (mínimo 6 requeridos)`);
        return;
      }

      const position = parseInt(parts[0]);
      if (isNaN(position)) {
        errors.push(`Línea ${index + 1}: Posición inválida "${parts[0]}"`);
        return;
      }

      // Validate time format (H:MM:SS or HH:MM:SS)
      const timeRegex = /^\d{1,2}:\d{2}:\d{2}$/;
      if (!timeRegex.test(parts[4])) {
        errors.push(`Línea ${index + 1}: Formato de tiempo inválido "${parts[4]}"`);
        return;
      }

      results.push({
        position,
        first_name: parts[1] || "",
        last_name: parts[2] || "",
        dorsal: parts[3] || "",
        time_net: parts[4] || "",
        time_gross: parts[5] || parts[4] || "",
        distance: parts[6] || "42k",
        category: parts[7] || "",
        nationality: parts[8] || "CHL",
        race_name: "Maratón de Santiago 2026",
        race_date: "2026-04-26",
      });
    });

    setParseErrors(errors);
    return results;
  };

  const handleImportCSV = () => {
    const parsed = parseCSV();
    if (parsed.length === 0) {
      toast({
        title: "Sin datos",
        description: "No se encontraron datos válidos para importar.",
        variant: "destructive",
      });
      return;
    }

    if (parseErrors.length > 0) {
      toast({
        title: "Errores en CSV",
        description: `Hay ${parseErrors.length} errores. Revisa los datos antes de importar.`,
        variant: "destructive",
      });
      return;
    }

    importCsvMutation.mutate(parsed);
  };

  const handleAddResult = () => {
    if (!newResult.first_name || !newResult.last_name || !newResult.time_net) {
      toast({
        title: "Campos requeridos",
        description: "Nombre, apellido y tiempo son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    addResultMutation.mutate(newResult);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Resultados de Maratón
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={importMode === "manual" ? "default" : "outline"}
            onClick={() => setImportMode("manual")}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Manual
          </Button>
          <Button
            variant={importMode === "csv" ? "default" : "outline"}
            onClick={() => setImportMode("csv")}
            size="sm"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
        </div>

        {/* CSV Import Section */}
        {importMode === "csv" && (
          <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
            <div>
              <Label className="text-sm font-medium">Formato CSV esperado:</Label>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                position,first_name,last_name,dorsal,time_net,time_gross,distance,category,nationality
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ejemplo: 1,Juan,Pérez,1234,3:15:42,3:16:01,42k,M40-44,CHL
              </p>
            </div>

            <Textarea
              placeholder="Pega aquí los datos CSV..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />

            {parseErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Errores encontrados:</span>
                </div>
                <ul className="text-xs space-y-1 text-destructive">
                  {parseErrors.slice(0, 5).map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                  {parseErrors.length > 5 && (
                    <li>... y {parseErrors.length - 5} errores más</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const parsed = parseCSV();
                  toast({
                    title: "Validación completada",
                    description: `${parsed.length} registros válidos, ${parseErrors.length} errores`,
                  });
                }}
                variant="outline"
                size="sm"
              >
                Validar
              </Button>
              <Button
                onClick={handleImportCSV}
                disabled={importCsvMutation.isPending || !csvData.trim()}
                size="sm"
              >
                {importCsvMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Importar
              </Button>
            </div>
          </div>
        )}

        {/* Manual Add Section */}
        {importMode === "manual" && (
          <Button onClick={() => setIsAddOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Resultado
          </Button>
        )}

        {/* Results Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16">Pos.</TableHead>
                <TableHead>Corredor</TableHead>
                <TableHead className="hidden sm:table-cell">Dorsal</TableHead>
                <TableHead>Distancia</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : results?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay resultados. Agrega el primero.
                  </TableCell>
                </TableRow>
              ) : (
                results?.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.position}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {result.first_name} {result.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {result.dorsal}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {result.dorsal}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.distance?.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{result.time_net}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteResultMutation.mutate(result.id)}
                        disabled={deleteResultMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Result Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Resultado</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Posición</Label>
                  <Input
                    type="number"
                    value={newResult.position || ""}
                    onChange={(e) =>
                      setNewResult({ ...newResult, position: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label>Dorsal</Label>
                  <Input
                    value={newResult.dorsal}
                    onChange={(e) =>
                      setNewResult({ ...newResult, dorsal: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={newResult.first_name}
                    onChange={(e) =>
                      setNewResult({ ...newResult, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Apellido</Label>
                  <Input
                    value={newResult.last_name}
                    onChange={(e) =>
                      setNewResult({ ...newResult, last_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tiempo Neto</Label>
                  <Input
                    placeholder="3:15:42"
                    value={newResult.time_net}
                    onChange={(e) =>
                      setNewResult({ ...newResult, time_net: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Tiempo Bruto</Label>
                  <Input
                    placeholder="3:16:01"
                    value={newResult.time_gross}
                    onChange={(e) =>
                      setNewResult({ ...newResult, time_gross: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Distancia</Label>
                  <Select
                    value={newResult.distance}
                    onValueChange={(v) => setNewResult({ ...newResult, distance: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="42k">42K</SelectItem>
                      <SelectItem value="21k">21K</SelectItem>
                      <SelectItem value="10k">10K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Input
                    placeholder="M40-44"
                    value={newResult.category}
                    onChange={(e) =>
                      setNewResult({ ...newResult, category: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Nacionalidad</Label>
                <Input
                  placeholder="CHL"
                  value={newResult.nationality}
                  onChange={(e) =>
                    setNewResult({ ...newResult, nationality: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddResult}
                disabled={addResultMutation.isPending}
              >
                {addResultMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
