// src/service/toggle_favorite.ts
import { API_URL } from "./default";

export default async function toggleFavorite(jobId: number) {
  try {
    const response = await fetch(`${API_URL}/favorites/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ job_id: jobId }),
    });

    if (!response.ok) {
      console.error("Erro ao alternar favorito:", response.status, response.statusText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro de rede:", error);
    return false;
  }
}