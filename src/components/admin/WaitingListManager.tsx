import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, Loader2, RefreshCw, Mail, Edit } from "lucide-react";
import { formatRut } from "@/lib/rut-validation";
import { EditWaitingEntryDialog } from "./EditWaitingEntryDialog";

type WaitingStatus = "pending" | "approved" | "rejected" | "invited" | "joined";

interface WaitingListEntry {
  id: string;
  rut: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  selected_distance: string | null;
  selected_difficulty: number | null;
  status: WaitingStatus;
  created_at: string;
  approved_at: string | null;
}

export function WaitingListManager() {
  const [entries, setEntries] = useState<WaitingListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<WaitingStatus | "all">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<WaitingListEntry | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const { toast } = useToast();

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("waiting_list")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching waiting list:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de espera",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const hasCompleteData = (entry: WaitingListEntry): boolean => {
    return !!(
      entry.rut &&
      entry.first_name &&
      entry.last_name &&
      entry.selected_distance &&
      entry.selected_difficulty
    );
  };

  const handleApprove = async (entry: WaitingListEntry) => {
    if (!hasCompleteData(entry)) {
      setEditingEntry(entry);
      return;
    }

    setProcessingId(entry.id);
    try {
      const { data, error } = await supabase.functions.invoke("approve-user", {
        body: { waiting_list_id: entry.id },
      });

      if (error) throw error;

      toast({
        title: "Usuario aprobado",
        description: `Se envió un correo a ${entry.email} con las credenciales`,
      });

      fetchEntries();
    } catch (error: any) {
      console.error("Error approving user:", error);
      toast({
        title: "Error al aprobar",
        description: error.message || "No se pudo aprobar al usuario",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveAndApprove = async (
    id: string,
    data: {
      rut: string;
      first_name: string;
      last_name: string;
      selected_distance: string;
      selected_difficulty: number;
    }
  ) => {
    setIsSavingEdit(true);
    try {
      // First update the waiting_list entry
      const { error: updateError } = await supabase
        .from("waiting_list")
        .update(data)
        .eq("id", id);

      if (updateError) throw updateError;

      // Then approve the user
      const { error: approveError } = await supabase.functions.invoke("approve-user", {
        body: { waiting_list_id: id },
      });

      if (approveError) throw approveError;

      toast({
        title: "Usuario aprobado",
        description: `Se guardaron los datos y se envió el correo con las credenciales`,
      });

      setEditingEntry(null);
      fetchEntries();
    } catch (error: any) {
      console.error("Error saving and approving:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo completar la operación",
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleReject = async (entry: WaitingListEntry) => {
    setProcessingId(entry.id);
    try {
      const { error } = await supabase
        .from("waiting_list")
        .update({ status: "rejected" as WaitingStatus })
        .eq("id", entry.id);

      if (error) throw error;

      toast({
        title: "Solicitud rechazada",
        description: `La solicitud de ${entry.email} fue rechazada`,
      });

      fetchEntries();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: WaitingStatus) => {
    const variants: Record<WaitingStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pendiente" },
      approved: { variant: "default", label: "Aprobado" },
      rejected: { variant: "destructive", label: "Rechazado" },
      invited: { variant: "secondary", label: "Invitado" },
      joined: { variant: "default", label: "Registrado" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDifficultyLabel = (difficulty: number | null) => {
    if (difficulty === 1) return "Principiante";
    if (difficulty === 2) return "Intermedio";
    return "-";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h3 className="text-lg font-semibold">Lista de Espera</h3>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as WaitingStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="approved">Aprobados</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchEntries} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay solicitudes {filter !== "all" ? `con estado "${filter}"` : ""}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RUT</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-sm">
                    {entry.rut ? formatRut(entry.rut) : (
                      <span className="text-muted-foreground italic">Sin RUT</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.first_name && entry.last_name
                      ? `${entry.first_name} ${entry.last_name}`
                      : (
                        <span className="text-muted-foreground italic">Sin nombre</span>
                      )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {entry.email}
                  </TableCell>
                  <TableCell>
                    {entry.selected_distance ? (
                      <div className="text-sm">
                        <span className="font-medium">{entry.selected_distance.toUpperCase()}</span>
                        <span className="text-muted-foreground ml-1">
                          ({getDifficultyLabel(entry.selected_difficulty)})
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Sin plan</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString("es-CL")}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        {!hasCompleteData(entry) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingEntry(entry)}
                            disabled={processingId === entry.id}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Completar
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(entry)}
                          disabled={processingId === entry.id}
                        >
                          {processingId === entry.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprobar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(entry)}
                          disabled={processingId === entry.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                    {entry.status === "approved" && (
                      <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        Correo enviado
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EditWaitingEntryDialog
        entry={editingEntry}
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        onSave={handleSaveAndApprove}
        isSaving={isSavingEdit}
      />
    </div>
  );
}
