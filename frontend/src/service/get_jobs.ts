import { API_URL } from "./default";

export default async function getJobs(limit?: string, category?: string) {
  try {
    if (!limit) limit = "20";
    if (!category) category = "";
    
    const response = await fetch(`${API_URL}?limit=${limit}&category=${category}`, {
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