package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"

	"go-react-backend/routes"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env variables globally
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Connect to our db (use pooling)
	connPool, err := pgxpool.New(context.Background(), os.Getenv("DB_URL")) // NEED DB_URL from .env
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	} else {
		fmt.Println("Successfuly connected to database.")
	}
	defer connPool.Close()

	// Create multiplexer for routing HTTP requests (using gorilla/mux)
	r := mux.NewRouter()

	// Register routes, our connPool will be accessible in our request contexts
	routes.RegisterRoutes(r, connPool)

	// Cors handler:
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // For now hardcoding in client server
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})
	handler := corsHandler.Handler(r)

	// Yippee! Starting our server using handler for mux and CORS
	fmt.Println("Server starting on port 8080")
	http.ListenAndServe(":8080", handler)
}
