package handler

import (
	"backend/services"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
)

type JobHandler struct {
	JobService *services.JobService
}

type FavoriteRequest struct {
	JobID int64 `json:"job_id"`
}

func NewJobHandler(js *services.JobService) *JobHandler {
	return &JobHandler{
		JobService: js,
	}
}

func (h *JobHandler) GetJobs(w http.ResponseWriter, r *http.Request) {
	// caso tenha id pega apenas o do id informado
	jobIDStr := r.URL.Query().Get("id")
	if jobIDStr != "" {
		jobID, err := strconv.ParseInt(jobIDStr, 10, 64)
		if err != nil {
			http.Error(w, "ID da vaga inválido", http.StatusBadRequest)
			return
		}

		job, err := h.JobService.GetJobByID(jobID)
		if err != nil {
			// Retorna 404 se a vaga não for encontrada
			if strings.Contains(err.Error(), "não encontrada") {
				http.Error(w, err.Error(), http.StatusNotFound)
			} else {
				log.Printf("Erro ao buscar vaga por ID: %v", err)
				http.Error(w, "Erro interno ao buscar a vaga", http.StatusInternalServerError)
			}
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(job)
		return
	}

	// caso contrario segue com os outros filtros pegando multiplos jobs
	category := r.URL.Query().Get("category")
	limit := r.URL.Query().Get("limit")

	jobs, err := h.JobService.GetJobsFromRemotive(category, limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobs)
}

func (h *JobHandler) ToggleFavoriteJob(w http.ResponseWriter, r *http.Request) {
	var favReq FavoriteRequest
	if err := json.NewDecoder(r.Body).Decode(&favReq); err != nil {
		http.Error(w, "Erro ao decodificar a requisição", http.StatusBadRequest)
		return
	}

	if err := h.JobService.ToggleFavorite(favReq.JobID); err != nil {
		log.Printf("Erro ao alternar favorito para a vaga %d: %v", favReq.JobID, err)
		http.Error(w, "Erro interno ao atualizar a vaga favorita", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Status de favorito atualizado com sucesso"))
}

func (h *JobHandler) GetFavoriteJobs(w http.ResponseWriter, r *http.Request) {
	jobs, err := h.JobService.GetFavorites()
	if err != nil {
		log.Printf("Erro ao listar vagas favoritas: %v", err)
		http.Error(w, "Erro interno ao buscar vagas favoritas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobs)
}
