// components/native/JobCard.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Job } from '@/lib/types';
import { MapPin, Clock, Heart, Building2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import toggleFavorite from '@/service/toggle_favorite';

const JobCard = ({ job, viewMode = "grid", isFavorite = false }: { job: Job, viewMode?: "grid" | "list", isFavorite?: boolean }) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [isToggling, setIsToggling] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(job.publication_date), { 
    addSuffix: true, 
    locale: ptBR 
  });

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsToggling(true);
    try {
      const success = await toggleFavorite(job.id);
      if (success) {
        setFavorite(!favorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsToggling(false);
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="flex flex-col md:flex-row hover:shadow-lg transition-shadow overflow-hidden">
        <div className="p-6 flex items-center justify-center md:border-r">
          <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span>{job.company_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.candidate_required_location}
                  </span>
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleToggleFavorite}
                disabled={isToggling}
              >
                <Heart 
                  className={`h-4 w-4 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pb-3">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">{job.category}</Badge>
              <Badge variant="outline">{job.job_type}</Badge>
            </div>
            
            <div className="text-sm text-muted-foreground line-clamp-2">
              {job.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {timeAgo}
            </div>
            <Link href={`/jobs/${job.id}`}>
              <Button size="sm">Ver Detalhes</Button>
            </Link>
          </CardFooter>
        </div>
      </Card>
    );
  }

  // Modo grid (padrão)
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{job.company_name}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.candidate_required_location}
              </span>
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleToggleFavorite}
            disabled={isToggling}
          >
            <Heart 
              className={`h-4 w-4 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary">{job.category}</Badge>
          <Badge variant="outline">{job.job_type}</Badge>
        </div>
        
        <div className="text-sm text-muted-foreground line-clamp-3">
          {job.description.replace(/<[^>]*>/g, '').substring(0, 120)}...
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          {timeAgo}
        </div>
        <Link href={`/jobs/${job.id}`}>
          <Button>Ver Detalhes</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default JobCard;