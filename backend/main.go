package main

import (
	"backend/db"       // Import for database connection
	"backend/routes"   // Import for routes
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// Database Initialization
	err := db.InitializeDB("./backend/db/bdate.db", "./backend/db/schema.sql")
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.CloseDB() // Ensure the database is closed when the app exits

	// Create a multiplexer for routing HTTP requests (using gorilla/mux)
	r := mux.NewRouter()

	// Register routes (handled in routes/routes.go)
	routes.RegisterRoutes(r)

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
