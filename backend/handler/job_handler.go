package handler

import (
	"backend/services"
	"encoding/json"
	"net/http"
)

type JobHandler struct {
	JobService *services.JobService
}

func NewJobHandler(js *services.JobService) *JobHandler {
	return &JobHandler{
		JobService: js,
	}
}

func (h *JobHandler) GetJobs(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

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
