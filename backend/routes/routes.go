package routes

import (
	"go-react-backend/handlers"
	"github.com/gorilla/mux"
)

func RegisterRoutes(r *mux.Router) {
	// Register API routes
	r.HandleFunc("/api/profiles", handlers.GetProfilesHandler).Methods("GET")
}