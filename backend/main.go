package main

import (
	"backend/database"
	"backend/handler"
	"backend/services"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erro ao carregar o arquivo .env")
	}

	db, err := database.ConnectionDB()
	if err != nil {
		log.Fatalf("Não foi possível conectar ao banco de dados: %v", err)
	}
	defer db.Close()

	jobService := services.NewJobService(db)
	jobHandler := handler.NewJobHandler(jobService)

	router := mux.NewRouter()
	router.HandleFunc("/api/jobs", jobHandler.GetJobs).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/favorites", jobHandler.GetFavoriteJobs).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/favorites/toggle", jobHandler.ToggleFavoriteJob).Methods("POST", "OPTIONS")

	allowedOrigins := handlers.AllowedOrigins([]string{"*"})
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	corsHandler := handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(router)

	fmt.Println("Servidor iniciado na porta :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", corsHandler))
}
