package services

import (
	"database/sql"
	"fmt"
)

type ToggleFavoriteJobService struct {
	DB *sql.DB
}

func NewToggleFavoriteJobService(db *sql.DB) *ToggleFavoriteJobService {
	return &ToggleFavoriteJobService{
		DB: db,
	}
}

func (s *ToggleFavoriteJobService) ToggleFavorite(jobID int64) error {
	query := `
		UPDATE jobs
		SET is_favorite = NOT is_favorite
		WHERE job_id = $1;
	`
	_, err := s.DB.Exec(query, jobID)
	if err != nil {
		return fmt.Errorf("erro ao alternar o status de favorito para a vaga %d: %v", jobID, err)
	}

	return nil
}
