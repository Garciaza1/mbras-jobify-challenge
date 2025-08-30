package models

import "time"

type RemotiveAPIResponse struct {
	Jobs []Job `json:"jobs"`
}
type Job struct {
	ID              int64     `json:"id"`
	Title           string    `json:"title"`
	Company         string    `json:"company_name"`
	Location        string    `json:"candidate_required_location"`
	Description     string    `json:"description"`
	JobType         string    `json:"job_type"`
	Category        string    `json:"category"`
	PublicationDate string    `json:"publication_date"`
	URL             string    `json:"url"`
	Tags            []string  `json:"tags"`
	IsFavorite      bool      `json:"is_favorite"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type JobsResponse struct {
	Jobs []Job `json:"jobs"`
}
