package routes

import (
	"database/sql"
	"go-react-backend/handlers"
	"go-react-backend/middleware"

	"github.com/gorilla/mux"
)

func RegisterRoutes(r *mux.Router, db *sql.DB) {
	// Add middleware
	r.Use(middleware.DbMiddleware(db))
	r.Use(middleware.AuthMiddleware)

	// query users table
	r.HandleFunc("/users", handlers.GetAllUsersHandler).Methods("GET")
	r.HandleFunc("/users/me", handlers.GetCurrentUserHandler).Methods("GET")
	r.HandleFunc("/users", handlers.PostUserHandler).Methods("POST")
	r.HandleFunc("/users", handlers.PatchUserHandler).Methods("PATCH")
	r.HandleFunc("/users", handlers.DeleteUserHandler).Methods("DELETE")

	// query availability table
	r.HandleFunc("/availability", handlers.GetAvailabilityHandler).Methods("GET")
	r.HandleFunc("/availability", handlers.PostAvailabilityHandler).Methods("POST")
	r.HandleFunc("/availability", handlers.PutAvailabilityHandler).Methods("PUT")
	r.HandleFunc("/availability", handlers.DeleteAvailabilityHandler).Methods("DELETE")

	// query similarity vector for the current user
	r.HandleFunc("/vector", handlers.GetVectorHandler).Methods("GET")
	r.HandleFunc("/vector", handlers.PutVectorHandler).Methods("PUT")
	r.HandleFunc("/vector", handlers.DeleteVectorHandler).Methods("DELETE")

	// query for matches
	r.HandleFunc("/matches", handlers.GetMatchesHandler).Methods("GET")

	// sync users data with supabase
	r.HandleFunc("/webhooks/users", handlers.UserSyncWebhookHandler).Methods("POST")
	r.HandleFunc("/webhooks/users", handlers.UserSyncWebhookHandler).Methods("PUT")
	r.HandleFunc("/webhooks/users", handlers.UserSyncWebhookHandler).Methods("DELETE")

}
