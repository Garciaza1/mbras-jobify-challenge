import { API_URL } from "./default";

export default async function getJobs(jobID: string) {
  try {
    const url = `${API_URL}/jobs?id=${jobID}`;
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error("Erro ao buscar dados da API do backend:", response.status, response.statusText);
      return [];
    }
    
    const jobs = await response.json();
    return jobs;
  } catch (error) {
    console.error("Erro de rede:", error);
    return [];
  }
}