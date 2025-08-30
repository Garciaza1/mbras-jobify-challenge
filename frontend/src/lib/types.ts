export interface Job {
  id: number;
  title: string;
  company_name: string;
  candidate_required_location: string;
  description: string;
  job_type: string;
  category: string;
  publication_date: string;
  url: string;
  tags: string[];
  is_favorite: boolean;
}