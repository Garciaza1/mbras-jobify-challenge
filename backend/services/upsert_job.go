package services

import (
	"backend/models"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"
)

type UpsertJobService struct {
	DB *sql.DB
}

func NewUpsertJobService(db *sql.DB) *UpsertJobService {
	return &UpsertJobService{
		DB: db,
	}
}

func (s *UpsertJobService) UpsertJobs(jobs []models.Job) error {
	for _, job := range jobs {
		tagsStr := strings.Join(job.Tags, ",")
		query := `
			INSERT INTO jobs (
				job_id,
				title,
				company_name,
				candidate_required_location,
				description,
				job_type,
				category,
				publication_date,
				url,
				tags,
				is_favorite,
				created_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
			) ON CONFLICT (job_id) DO UPDATE SET
				title = EXCLUDED.title,
				company_name = EXCLUDED.company_name,
				candidate_required_location = EXCLUDED.candidate_required_location,
				description = EXCLUDED.description,
				job_type = EXCLUDED.job_type,
				category = EXCLUDED.category,
				publication_date = EXCLUDED.publication_date,
				url = EXCLUDED.url,
				tags = EXCLUDED.tags,
				updated_at = NOW();
		`
		if _, err := s.DB.Exec(
			query,
			job.ID,
			job.Title,
			job.Company,
			job.Location,
			job.Description,
			job.JobType,
			job.Category,
			job.PublicationDate,
			job.URL,
			tagsStr,
			false,
			time.Now(),
		); err != nil {
			log.Printf("Erro ao salvar/atualizar a vaga com ID %d: %v", job.ID, err)
			return fmt.Errorf("erro ao salvar/atualizar a vaga com ID %d: %v", job.ID, err)
		}
		log.Printf("Vaga com ID %d salva com sucesso!", job.ID)
	}
	return nil
}
