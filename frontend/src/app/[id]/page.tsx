'use client';

import { Job } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  MapPin, 
  Building2, 
  Globe, 
  Clock, 
  ArrowLeft,
  Share2,
  Bookmark,
  ExternalLink,
  Briefcase,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/native/header';

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/jobs?id=${params.id}`);
        
        if (!response.ok) {
          throw new Error('Job não encontrado');
        }
        
        const jobData = await response.json();
        setJob(jobData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar vaga');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: job?.description.substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Header />
        <div className="container max-w-4xl py-8">
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          
          <div className="grid gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Header />
        <div className="container max-w-4xl py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-zinc-900 mb-4">Vaga não encontrada</h1>
            <p className="text-zinc-600 mb-8">{error}</p>
            <Link href="/">
              <Button className="bg-zinc-900 hover:bg-zinc-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para vagas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      
      <div className="container max-w-4xl py-8">
        {/* Header da vaga */}
        <div className="mb-8">
          <Link href="/jobs">
            <Button variant="ghost" className="mb-6 text-zinc-600 hover:text-zinc-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para vagas
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-4 bg-zinc-200 text-zinc-800">
                {job.category}
              </Badge>
              
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">{job.title}</h1>
              
              <div className="flex items-center gap-4 text-zinc-600 mb-4">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{job.company_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.candidate_required_location}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="flex items-center gap-1 bg-zinc-100">
                  <Briefcase className="h-3 w-3" />
                  {job.job_type}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 bg-zinc-100">
                  <Calendar className="h-3 w-3" />
                  {formatDate(job.publication_date)}
                </Badge>
                {job.tags.length > 0 && job.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-zinc-100">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 lg:flex-col">
              <Button 
                variant="outline" 
                size="lg"
                className="border-zinc-300 hover:bg-zinc-100"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              
              <Button 
                variant={isSaved ? "default" : "outline"}
                size="lg"
                className={`${
                  isSaved 
                    ? 'bg-zinc-900 hover:bg-zinc-800' 
                    : 'border-zinc-300 hover:bg-zinc-100'
                }`}
                onClick={() => setIsSaved(!isSaved)}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-white' : ''}`} />
                {isSaved ? 'Salvo' : 'Salvar'}
              </Button>
              
              <Button 
                size="lg"
                className="bg-zinc-900 hover:bg-zinc-800"
                asChild
              >
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  Candidatar-se
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Grid de informações */}
        <div className="grid gap-6">
          {/* Descrição da vaga */}
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle className="text-xl text-zinc-900">Descrição da Vaga</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-zinc max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </CardContent>
          </Card>

          {/* Detalhes adicionais */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Informações da empresa */}
            <Card className="border-zinc-200">
              <CardHeader>
                <CardTitle className="text-lg text-zinc-900">Sobre a Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">{job.company_name}</p>
                    <p className="text-sm text-zinc-600">Empresa</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">{job.candidate_required_location}</p>
                    <p className="text-sm text-zinc-600">Localização</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">Remoto</p>
                    <p className="text-sm text-zinc-600">Tipo de trabalho</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes da vaga */}
            <Card className="border-zinc-200">
              <CardHeader>
                <CardTitle className="text-lg text-zinc-900">Detalhes da Vaga</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">{job.job_type}</p>
                    <p className="text-sm text-zinc-600">Tipo de contrato</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">{job.category}</p>
                    <p className="text-sm text-zinc-600">Categoria</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">{formatDate(job.publication_date)}</p>
                    <p className="text-sm text-zinc-600">Publicada em</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">Ativa</p>
                    <p className="text-sm text-zinc-600">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags e habilidades */}
          {job.tags.length > 0 && (
            <Card className="border-zinc-200">
              <CardHeader>
                <CardTitle className="text-lg text-zinc-900">Habilidades Requeridas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.tags.length > 0 && job.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Final */}
          <Card className="border-zinc-200 bg-zinc-900 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Interessado nesta vaga?</h3>
                <p className="text-zinc-300 mb-6">
                  Candidate-se agora e dê o próximo passo na sua carreira
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-white text-zinc-900 hover:bg-zinc-100"
                    asChild
                  >
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      Candidatar-se Agora
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-zinc-800"
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-white' : ''}`} />
                    {isSaved ? 'Remover dos Salvos' : 'Salvar para Depois'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}