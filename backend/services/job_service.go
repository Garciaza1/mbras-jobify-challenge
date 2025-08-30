package services

import (
	"backend/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

type JobService struct {
	DB *sql.DB
}

func NewJobService(db *sql.DB) *JobService {
	return &JobService{
		DB: db,
	}
}

func (s *JobService) GetJobsFromRemotive(category string, limit string) ([]models.Job, error) {
	remotiveAPIURL := os.Getenv("REMOTIVE_API_URL")
	if remotiveAPIURL == "" {
		return nil, fmt.Errorf("REMOTIVE_API_URL não definida no .env")
	}

	baseURL, err := url.Parse(remotiveAPIURL)
	if err != nil {
		return nil, fmt.Errorf("erro ao analisar a URL base: %v", err)
	}

	query := baseURL.Query()
	query.Set("limit", "50")

	if limit != "" {
		query.Set("limit", limit)
	}

	if category != "" {
		query.Set("category", category)
	}

	baseURL.RawQuery = query.Encode()

	resp, err := http.Get(baseURL.String())
	if err != nil {
		return nil, fmt.Errorf("erro ao fazer requisição para a API do Remotive: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("erro na resposta da API do Remotive. Status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("erro ao ler o corpo da resposta: %v", err)
	}

	var apiResponse models.RemotiveAPIResponse
	err = json.Unmarshal(body, &apiResponse)
	if err != nil {
		return nil, fmt.Errorf("erro ao decodificar a resposta JSON: %v", err)
	}

	favoriteIDs, err := s.GetFavoriteJobIDs()
	if err != nil {
		log.Printf("Aviso: Não foi possível obter IDs de favoritos, exibindo todos como não favoritos: %v", err)
	}

	jobsToReturn := make([]models.Job, 0, len(apiResponse.Jobs))
	for _, job := range apiResponse.Jobs {
		if _, ok := favoriteIDs[job.ID]; ok {
			job.IsFavorite = true
		}
		jobsToReturn = append(jobsToReturn, job)
	}

	go func() {
		log.Println("Goroutine de salvamento iniciada.")
		if err := s.UpsertJobs(apiResponse.Jobs); err != nil {
			log.Printf("Erro no salvamento assíncrono: %v", err)
		} else {
			log.Println("Salvamento assíncrono concluído com sucesso.")
		}
	}()

	return jobsToReturn, nil
}

func (s *JobService) UpsertJobs(jobs []models.Job) error {
	for _, job := range jobs {
		tagsStr := strings.Join(job.Tags, ",")
		query := `
			INSERT INTO jobs (
				job_id, title, company_name, candidate_required_location,
				description, job_type, category, publication_date,
				url, tags, is_favorite, created_at
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
		if _, err := s.DB.Exec(query, job.ID, job.Title, job.Company, job.Location, job.Description, job.JobType, job.Category, job.PublicationDate, job.URL, tagsStr, false, time.Now()); err != nil {
			log.Printf("Erro ao salvar/atualizar a vaga com ID %d: %v", job.ID, err)
			return fmt.Errorf("erro ao salvar/atualizar a vaga com ID %d: %v", job.ID, err)
		}
		log.Printf("Vaga com ID %d salva com sucesso!", job.ID)
	}
	return nil
}

func (s *JobService) ToggleFavorite(jobID int64) error {
	query := `
		UPDATE jobs
		SET is_favorite = NOT is_favorite
		WHERE job_id = $1;
	`
	if _, err := s.DB.Exec(query, jobID); err != nil {
		return fmt.Errorf("erro ao alternar o status de favorito para a vaga %d: %v", jobID, err)
	}

	return nil
}

func (s *JobService) GetFavorites() ([]models.Job, error) {
	query := `SELECT * FROM jobs WHERE is_favorite = TRUE;`

	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar vagas favoritas: %v", err)
	}
	defer rows.Close()

	var jobs []models.Job
	for rows.Next() {
		var job models.Job
		var tags string
		var createdAt, updatedAt time.Time

		if err := rows.Scan(
			&job.ID, &job.Title, &job.Company, &job.Location, &job.Description,
			&job.JobType, &job.Category, &job.PublicationDate, &job.URL, &tags,
			&job.IsFavorite, &createdAt, &updatedAt,
		); err != nil {
			return nil, fmt.Errorf("erro ao escanear linha: %v", err)
		}

		job.Tags = strings.Split(tags, ",")
		job.CreatedAt = createdAt
		job.UpdatedAt = updatedAt

		jobs = append(jobs, job)
	}

	return jobs, nil
}

func (s *JobService) GetFavoriteJobIDs() (map[int64]bool, error) {
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
