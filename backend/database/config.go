package database

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	_ "github.com/lib/pq"
)

func ConnectionDB() (*sql.DB, error) {
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	var db *sql.DB
	var err error
	maxRetries := 10
	retryInterval := 5 * time.Second

	for i := 0; i < maxRetries; i++ {
		db, err = sql.Open("postgres", connStr)
		if err != nil {
			fmt.Printf("Tentativa %d/%d: erro ao abrir a conexão. Tentando novamente em %v...\n", i+1, maxRetries, retryInterval)
			time.Sleep(retryInterval)
			continue
		}

		if err := db.Ping(); err != nil {
			db.Close()
			fmt.Printf("Tentativa %d/%d: erro ao conectar ao banco de dados. Tentando novamente em %v...\n", i+1, maxRetries, retryInterval)
			time.Sleep(retryInterval)
			continue
		}

		fmt.Println("Conexão com o banco de dados estabelecida com sucesso! ✅")
		return db, nil
	}

	fmt.Println("Conexão com o banco de dados estabelecida com sucesso! ✅")
	return db, nil
}