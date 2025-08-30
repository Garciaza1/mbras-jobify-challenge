import { API_URL } from "./default";

export default async function getFavorites() {
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error("Erro ao buscar favoritos:", response.status, response.statusText);
      return [];
    }
    
    const favorites = await response.json();
    return favorites;
  } catch (error) {
    console.error("Erro de rede:", error);
    return [];
  }
}