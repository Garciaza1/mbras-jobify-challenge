package services

import (
	"backend/models"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type GetFavoriteJobService struct {
	DB *sql.DB
}

func NewGetFavoriteJobService(db *sql.DB) *GetFavoriteJobService {
	return &GetFavoriteJobService{
		DB: db,
	}
}

func (s *GetFavoriteJobService) GetFavorites() ([]models.Job, error) {
	query := `SELECT * FROM jobs WHERE is_favorite = TRUE;`

	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar vagas favoritas: %v", err)
	}
	defer rows.Close()

	var jobs []models.Job
	for rows.Next() {
		var job models.Job
		var tags string // Para escanear a string de tags do banco de dados
		var createdAt, updatedAt time.Time

		if err := rows.Scan(
			&job.ID, &job.Title, &job.Company, &job.Location, &job.Description,
			&job.JobType, &job.Category, &job.PublicationDate, &job.URL, &tags,
			&job.IsFavorite, &createdAt, &updatedAt,
		); err != nil {
			return nil, fmt.Errorf("erro ao escanear linha: %v", err)
		}

		job.Tags = strings.Split(tags, ",") // Converte a string de tags de volta para uma slice
		job.CreatedAt = createdAt
		job.UpdatedAt = updatedAt

		jobs = append(jobs, job)
	}

	return jobs, nil
}
