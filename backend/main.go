package main

import (
	"backend/database"
	"backend/handler"
	"backend/services"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
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

	upsertService := services.NewUpsertJobService(db)
	jobService := services.NewJobService(upsertService)
	jobHandler := handler.NewJobHandler(jobService)

	router := mux.NewRouter()
	router.HandleFunc("/api/jobs", jobHandler.GetJobs).Methods("GET")

	allowedOrigins := handlers.AllowedOrigins([]string{"*"})
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	// Envolve o roteador com o middleware de CORS
	corsHandler := handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(router)

	fmt.Println("Servidor iniciado na porta :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", corsHandler))
}
