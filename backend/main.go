package main

import ( // Import for database connection
	"database/sql"
	"fmt"
	"go-react-backend/routes" // Import for routes
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// Create a multiplexer for routing HTTP requests (using gorilla/mux)
	r := mux.NewRouter()

	// load environment vars
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// connection pool to db
	db, err := sql.Open("sqlite", "./bdate.db")
	if err != nil {
		log.Fatalf("Failed to connect to SQLite: %v", err)
	}
	defer db.Close()

	// Register routes, pass our connection
	routes.RegisterRoutes(r, db)

	// Configure CORS (allowing the React frontend to communicate with the backend)
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Update with your frontend URL if needed
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})
	handler := corsHandler.Handler(r)

	// Starting the HTTP server
	server := &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}

	// Graceful shutdown setup
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		fmt.Println("Server starting on port 8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server failed: %v", err)
		}
	}()

	// Wait for a termination signal and gracefully shut down
	<-stop
	fmt.Println("\nShutting down server...")
	if err := server.Close(); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}
	fmt.Println("Server stopped")
}
