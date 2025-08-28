package main

import (
	"backend/handler"
	"backend/services"
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erro ao carregar o arquivo .env")
	}

	db, err := sql.Open("postgres", "postgres://user:password@localhost/database_name?sslmode=disable")
	if err != nil {
		log.Fatal("Erro ao conectar ao banco de dados: ", err)
	}
	defer db.Close()

	jobService := services.NewJobService(db)
	jobHandler := handler.NewJobHandler(jobService)

	router := mux.NewRouter()

	router.HandleFunc("/api/jobs", jobHandler.GetJobs).Methods("GET")

	fmt.Println("Servidor iniciado na porta :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
