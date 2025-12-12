import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, Search, Filter, Award, Flag } from "lucide-react";

export default function Results() {
  const [searchDorsal, setSearchDorsal] = useState("");
  const [distanceFilter, setDistanceFilter] = useState<string>("all");

  const { data: results, isLoading } = useQuery({
    queryKey: ["marathon-results", distanceFilter],
    queryFn: async () => {
      let query = supabase
        .from("marathon_results")
        .select("*")
        .order("position", { ascending: true })
        .limit(100);

      if (distanceFilter !== "all") {
        query = query.eq("distance", distanceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const searchedResult = results?.find(
    (r) => r.dorsal?.toLowerCase() === searchDorsal.toLowerCase()
  );

  const filteredResults = results || [];

  const getMedalIcon = (position: number | null) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/30">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            ¡HAS LLEGADO A LA META!
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Celebra tu esfuerzo, tu coraje y cada kilómetro que te trajo hasta aquí.
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <Badge variant="outline" className="px-4 py-2 text-base border-primary/50">
              <Flag className="h-4 w-4 mr-2" />
              Maratón de Santiago 2026
            </Badge>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 px-4 border-y border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search by Dorsal */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por número de dorsal..."
                value={searchDorsal}
                onChange={(e) => setSearchDorsal(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Distance Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Distancia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="42k">42K</SelectItem>
                  <SelectItem value="21k">21K</SelectItem>
                  <SelectItem value="10k">10K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Result Card */}
          {searchDorsal && searchedResult && (
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary">
                  <span className="text-2xl font-bold text-primary">
                    #{searchedResult.position}
                  </span>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl font-bold text-foreground">
                    {searchedResult.first_name} {searchedResult.last_name}
                  </h3>
                  <p className="text-muted-foreground">
                    Dorsal: {searchedResult.dorsal} • {searchedResult.distance?.toUpperCase()} • {searchedResult.category}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary font-mono">
                    {searchedResult.time_net}
                  </p>
                  <p className="text-sm text-muted-foreground">Tiempo Neto</p>
                </div>
              </div>
            </div>
          )}

          {searchDorsal && !searchedResult && (
            <div className="mt-6 p-4 rounded-xl bg-muted/50 text-center">
              <p className="text-muted-foreground">
                No se encontró ningún resultado para el dorsal "{searchDorsal}"
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Results Table Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Award className="h-8 w-8 text-primary" />
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Ranking Top 100
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16 text-center">Pos.</TableHead>
                    <TableHead>Corredor</TableHead>
                    <TableHead className="hidden sm:table-cell">Dorsal</TableHead>
                    <TableHead className="hidden md:table-cell">Categoría</TableHead>
                    <TableHead className="text-center">Distancia</TableHead>
                    <TableHead className="text-right">Tiempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow
                      key={result.id}
                      className={
                        result.position && result.position <= 3
                          ? "bg-primary/5"
                          : ""
                      }
                    >
                      <TableCell className="text-center font-medium">
                        <div className="flex items-center justify-center gap-1">
                          {getMedalIcon(result.position)}
                          <span>{result.position}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
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
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {result.category}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">
                          {result.distance?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-primary">
                        {result.time_net}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay resultados disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
