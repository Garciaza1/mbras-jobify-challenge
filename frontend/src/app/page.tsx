'use client';
import JobCard from "@/components/native/JobCard";
import { Job } from "@/lib/types";
import getJobs from "@/service/get_jobs";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Filter, AlertCircle, } from "lucide-react";
import Header from "@/components/native/header";

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [showRemoteOnly, setShowRemoteOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Extrair categorias únicas para filtros
  const categories = ["all", ...new Set(jobs.map(job => job.category))];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const jobsData = await getJobs();

        if (jobsData.error) {
          setError(jobsData.error);
          setJobs([]);
        } else {
          setJobs(jobsData);
          setFilteredJobs(jobsData);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Erro ao carregar vagas");
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = jobs;

    if (searchQuery) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(job => job.category === selectedCategory);
    }

    if (locationFilter !== "all") {
      result = result.filter(job => job.candidate_required_location === locationFilter);
    }

    if (showRemoteOnly) {
      result = result.filter(job => job.candidate_required_location.toLowerCase().includes("remote"));
    }

    if (jobType !== "all") {
      result = result.filter(job => job.job_type === jobType);
    }

    setFilteredJobs(result);
  }, [jobs, searchQuery, selectedCategory, locationFilter, showRemoteOnly, jobType]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container flex flex-col gap-8 py-8 md:flex-row">
        {/* Filtros Sidebar */}
        <aside className="hidden w-full md:block md:w-1/4 lg:w-1/5">
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <Button variant="ghost" size="sm">
                  Limpar
                </Button>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Categoria Frontend</Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === "all" ? "Todas categorias" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1">
          {/* Barra de pesquisa e controles */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por cargo, empresa ou palavra-chave..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filteredJobs.length} vagas encontradas
                </Badge>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Tabs defaultValue="grid" className="w-fit" onValueChange={(v) => setViewMode(v as "grid" | "list")}>
                  <TabsList>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                    <TabsTrigger value="list">Lista</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Lista de vagas */}
          {isLoading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-full overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredJobs.map((job: Job) => (
                <JobCard key={job.id} job={job} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-muted-foreground mb-6">
                Tente ajustar seus filtros ou termos de pesquisa para encontrar mais resultados.
              </p>
              <Button onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setLocationFilter("all");
                setJobType("all");
                setShowRemoteOnly(false);
              }}>
                Limpar filtros
              </Button>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-destructive/10 p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-medium mb-2">Erro ao carregar vagas</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobList;