package services

import "fmt"

func (s *UpsertJobService) GetFavoriteJobIDs() (map[int64]bool, error) {
	query := `SELECT job_id FROM jobs WHERE is_favorite = TRUE;`
	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar IDs de vagas favoritas: %v", err)
	}
	defer rows.Close()

	favoriteIDs := make(map[int64]bool)
	for rows.Next() {
		var jobID int64
		if err := rows.Scan(&jobID); err != nil {
			return nil, fmt.Errorf("erro ao escanear ID de vaga: %v", err)
		}
		favoriteIDs[jobID] = true
	}

	return favoriteIDs, nil
}
