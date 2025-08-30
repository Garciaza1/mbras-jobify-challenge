package services

// vai pegar os dados da api e retornar para o controller (salvar no banco de dados numa go routine)
// vai ser event driven
// vai verificar se os dados já existem no banco antes de enviar
// caso tenha, vai enviar contendo o campo favorited

import (
	"backend/models"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
)

type JobService struct {
	UpsertJobService *UpsertJobService
}

func NewJobService(upsertService *UpsertJobService) *JobService {
	return &JobService{
		UpsertJobService: upsertService,
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

	if limit != "" { // da prioridade para o limite da query
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

	// Obter IDs de vagas favoritas do banco de dados
	favoriteIDs, err := s.UpsertJobService.GetFavoriteJobIDs()
	if err != nil {
		log.Printf("Aviso: Não foi possível obter IDs de favoritos, exibindo todos como não favoritos: %v", err)
	}

	// juntar na resposta
	jobsToReturn := make([]models.Job, 0, len(apiResponse.Jobs))
	for _, job := range apiResponse.Jobs {
		if _, ok := favoriteIDs[job.ID]; ok {
			job.IsFavorite = true
		}
		jobsToReturn = append(jobsToReturn, job)
	}

	// salvar no banco de dados em segundo plano
	go func() {
		log.Println("Goroutine de salvamento iniciada.")
		if err := s.UpsertJobService.UpsertJobs(apiResponse.Jobs); err != nil {
			log.Printf("Erro no salvamento assíncrono: %v", err)
		} else {
			log.Println("Salvamento assíncrono concluído com sucesso.")
		}
	}()

	return jobsToReturn, nil
}
