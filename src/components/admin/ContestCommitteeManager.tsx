import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Trophy, Video, Users, Crown, Save, RefreshCw, Play, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PreselectedEntry {
  id: string;
  user_id: string;
  rank: number | null;
  score: number | null;
  completion_percent: number | null;
  photo_percent: number | null;
  video_url: string | null;
  video_uploaded_at: string | null;
  is_preselected: boolean;
  committee_selected: boolean;
  committee_notes: string | null;
  final_winner: boolean;
  user_profile: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    rut: string | null;
    distance: string | null;
    difficulty: number | null;
  } | null;
}

interface Contest {
  id: string;
  name: string;
  code: string;
  current_phase: string | null;
  max_winners: number | null;
  preselection_count: number | null;
  video_deadline: string | null;
}

export function ContestCommitteeManager() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [entries, setEntries] = useState<PreselectedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [localChanges, setLocalChanges] = useState<Record<string, Partial<PreselectedEntry>>>({});

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    const { data, error } = await supabase
      .from('contests')
      .select('id, name, code, current_phase, max_winners, preselection_count, video_deadline')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar concursos');
      return;
    }

    setContests(data || []);
    if (data && data.length > 0) {
      setSelectedContest(data[0]);
    }
    setIsLoading(false);
  };

  const fetchPreselectedEntries = useCallback(async () => {
    if (!selectedContest) return;

    setIsLoading(true);
    
    // Fetch ALL entries for this contest (not just preselected)
    // This allows the admin to see all participants regardless of phase
    const { data: entriesData, error: entriesError } = await supabase
      .from('contest_entries')
      .select('*')
      .eq('contest_id', selectedContest.id)
      .order('rank', { ascending: true, nullsFirst: false })
      .order('score', { ascending: false });

    if (entriesError) {
      toast.error('Error al cargar participantes');
      setIsLoading(false);
      return;
    }

    // Fetch user profiles for each entry
    const userIds = entriesData?.map(e => e.user_id) || [];
    
    let profilesData: any[] = [];
    if (userIds.length > 0) {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, rut, distance, difficulty')
        .in('id', userIds);
      profilesData = data || [];
    }

    const profilesMap = new Map(profilesData.map(p => [p.id, p]));

    const enrichedEntries: PreselectedEntry[] = (entriesData || []).map(entry => ({
      ...entry,
      user_profile: profilesMap.get(entry.user_id) || null,
    }));

    setEntries(enrichedEntries);
    setLocalChanges({});
    setIsLoading(false);
  }, [selectedContest]);

  useEffect(() => {
    if (selectedContest) {
      fetchPreselectedEntries();
    }
  }, [selectedContest, fetchPreselectedEntries]);

  const handleSelectToggle = (entryId: string, currentValue: boolean) => {
    setLocalChanges(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        committee_selected: !currentValue,
      },
    }));
  };

  const handleNotesChange = (entryId: string, notes: string) => {
    setLocalChanges(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        committee_notes: notes,
      },
    }));
  };

  const getEntryValue = (entry: PreselectedEntry, field: keyof PreselectedEntry) => {
    if (localChanges[entry.id]?.[field] !== undefined) {
      return localChanges[entry.id][field];
    }
    return entry[field];
  };

  const saveChanges = async () => {
    if (Object.keys(localChanges).length === 0) {
      toast.info('No hay cambios para guardar');
      return;
    }

    setIsSaving(true);

    try {
      for (const [entryId, changes] of Object.entries(localChanges)) {
        const { error } = await supabase
          .from('contest_entries')
          .update(changes)
          .eq('id', entryId);

        if (error) throw error;
      }

      toast.success('Cambios guardados correctamente');
      await fetchPreselectedEntries();
    } catch (error) {
      toast.error('Error al guardar cambios');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const markFinalWinners = async () => {
    if (!selectedContest) return;

    const selectedEntries = entries.filter(e => 
      getEntryValue(e, 'committee_selected') === true
    );

    if (selectedEntries.length === 0) {
      toast.error('No has seleccionado ningún ganador');
      return;
    }

    if (selectedEntries.length > (selectedContest.max_winners || 30)) {
      toast.error(`Solo puedes seleccionar hasta ${selectedContest.max_winners || 30} ganadores`);
      return;
    }

    setIsSaving(true);

    try {
      // First save any pending local changes
      for (const [entryId, changes] of Object.entries(localChanges)) {
        await supabase
          .from('contest_entries')
          .update(changes)
          .eq('id', entryId);
      }

      // Mark selected entries as final winners
      const selectedIds = selectedEntries.map(e => e.id);
      const { error } = await supabase
        .from('contest_entries')
        .update({ final_winner: true })
        .in('id', selectedIds);

      if (error) throw error;

      // Update contest phase to winners_announced
      await supabase
        .from('contests')
        .update({ current_phase: 'winners_announced' })
        .eq('id', selectedContest.id);

      toast.success(`${selectedEntries.length} ganadores finales marcados`);
      await fetchPreselectedEntries();
      await fetchContests();
    } catch (error) {
      toast.error('Error al marcar ganadores');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = entries.filter(e => 
    getEntryValue(e, 'committee_selected') === true
  ).length;

  const videosSubmittedCount = entries.filter(e => e.video_url).length;

  if (isLoading && contests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contest Selector */}
      <div className="flex items-center gap-4">
        <Select
          value={selectedContest?.id || ''}
          onValueChange={(value) => {
            const contest = contests.find(c => c.id === value);
            setSelectedContest(contest || null);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccionar concurso" />
          </SelectTrigger>
          <SelectContent>
            {contests.map(contest => (
              <SelectItem key={contest.id} value={contest.id}>
                {contest.name} ({contest.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedContest && (
          <Badge variant={
            selectedContest.current_phase === 'winners_announced' ? 'default' :
            selectedContest.current_phase === 'committee_review' ? 'secondary' :
            'outline'
          }>
            {selectedContest.current_phase === 'accumulation' && 'Acumulación'}
            {selectedContest.current_phase === 'video_submission' && 'Subida de Videos'}
            {selectedContest.current_phase === 'committee_review' && 'Revisión Comité'}
            {selectedContest.current_phase === 'winners_announced' && 'Ganadores Anunciados'}
          </Badge>
        )}
      </div>

      {selectedContest && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{entries.length}</p>
                  <p className="text-sm text-muted-foreground">Total Participantes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Video className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{videosSubmittedCount}</p>
                  <p className="text-sm text-muted-foreground">Videos Subidos</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{selectedCount} / {selectedContest.max_winners || 30}</p>
                  <p className="text-sm text-muted-foreground">Seleccionados</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Trophy className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{entries.filter(e => e.final_winner).length}</p>
                  <p className="text-sm text-muted-foreground">Ganadores Finales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchPreselectedEntries}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            <Button
              onClick={saveChanges}
              disabled={isSaving || Object.keys(localChanges).length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>

            <Button
              variant="default"
              onClick={markFinalWinners}
              disabled={isSaving || selectedCount === 0 || selectedContest.current_phase === 'winners_announced'}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Confirmar {selectedCount} Ganadores
            </Button>
          </div>

          {/* Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Todos los Participantes 
                {entries.filter(e => e.is_preselected).length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {entries.filter(e => e.is_preselected).length} preseleccionados
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Sel.</TableHead>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Participante</TableHead>
                      <TableHead className="w-24">Distancia</TableHead>
                      <TableHead className="w-32">Puntaje</TableHead>
                      <TableHead className="w-24">Video</TableHead>
                      <TableHead className="w-64">Notas del Comité</TableHead>
                      <TableHead className="w-24">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow 
                        key={entry.id}
                        className={
                          entry.final_winner 
                            ? 'bg-yellow-500/10' 
                            : getEntryValue(entry, 'committee_selected') 
                              ? 'bg-primary/5' 
                              : ''
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={getEntryValue(entry, 'committee_selected') as boolean}
                            onCheckedChange={() => handleSelectToggle(
                              entry.id, 
                              getEntryValue(entry, 'committee_selected') as boolean
                            )}
                            disabled={entry.final_winner}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="font-mono">
                              #{entry.rank || '-'}
                            </Badge>
                            {entry.is_preselected && (
                              <Badge variant="default" className="text-[10px]">
                                Top 100
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {entry.user_profile?.first_name || ''} {entry.user_profile?.last_name || ''}
                              </p>
                              <p className="text-xs text-muted-foreground">{entry.user_profile?.email}</p>
                              {entry.user_profile?.rut && (
                                <p className="text-xs text-muted-foreground">RUT: {entry.user_profile.rut}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{entry.user_profile?.distance || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Score</span>
                              <span className="font-mono">{(entry.score ?? 0).toFixed(1)}%</span>
                            </div>
                            <Progress value={entry.score ?? 0} className="h-1.5" />
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>✓ {(entry.completion_percent ?? 0).toFixed(0)}%</span>
                              <span>📷 {(entry.photo_percent ?? 0).toFixed(0)}%</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.video_url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVideoPreview(entry.video_url)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin video</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Notas..."
                            value={(getEntryValue(entry, 'committee_notes') as string) || ''}
                            onChange={(e) => handleNotesChange(entry.id, e.target.value)}
                            className="min-h-[60px] text-xs"
                            disabled={entry.final_winner}
                          />
                        </TableCell>
                        <TableCell>
                          {entry.final_winner ? (
                            <Badge className="bg-yellow-500 text-yellow-950">
                              <Trophy className="h-3 w-3 mr-1" />
                              Ganador
                            </Badge>
                          ) : getEntryValue(entry, 'committee_selected') ? (
                            <Badge variant="secondary">Seleccionado</Badge>
                          ) : (
                            <Badge variant="outline">Pendiente</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}

      {/* Video Preview Dialog */}
      <Dialog open={!!videoPreview} onOpenChange={() => setVideoPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Video de Presentación</DialogTitle>
          </DialogHeader>
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
