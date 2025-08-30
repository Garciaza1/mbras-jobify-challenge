import { API_URL } from "./default";

export default async function getJob(jobID: string) {
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
      return null;
    }
    
    const job = await response.json();
    return job;
  } catch (error) {
    console.error("Erro de rede:", error);
    return null;
  }
}