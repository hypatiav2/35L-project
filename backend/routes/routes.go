package routes

import (
	"database/sql"
	"go-react-backend/handlers"
	"go-react-backend/middleware"

	"github.com/gorilla/mux"
)

func RegisterRoutes(r *mux.Router, db *sql.DB) {
	r.Use(middleware.DbMiddleware(db))
	// Register API routes
	r.HandleFunc("/api/profiles", handlers.GetProfilesHandler).Methods("GET")

	r.HandleFunc("/api/availability", handlers.GetAvailabilityHandler).Methods("GET")
}
