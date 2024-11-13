package main

import (
	"fmt"
	"net/http"

	"github.com/rs/cors"

	"go-react-backend/routes"

	"github.com/gorilla/mux"
)

func main() {
	// Create multiplexer for routing HTTP requests (using gorilla/mux)
	r := mux.NewRouter()

	// Register routes (handled in routes/routes.go)
	routes.RegisterRoutes(r)

	// Cors handler:
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // For now hardcoding in client server
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})
	handler := corsHandler.Handler(r)

	// Yippee! Starting our sserver using handler for mux and CORS
	fmt.Println("Server starting on port 8080")
	http.ListenAndServe(":8080", handler)
}
