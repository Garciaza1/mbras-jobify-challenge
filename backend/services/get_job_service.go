package services

// vai pegar os dados da api e retornar para o controller (salvar no banco de dados numa go routine)
//vai ser event driven

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

	// vamos intanciar um outro service apenas para salvar no postgres
	go func() {
		log.Println("Goroutine de salvamento iniciada.")
		if err := s.UpsertJobService.UpsertJobs(apiResponse.Jobs); err != nil {
			log.Printf("Erro no salvamento assíncrono: %v", err)
		} else {
			log.Println("Salvamento assíncrono concluído com sucesso.")
		}
	}()

	return apiResponse.Jobs, nil
}
