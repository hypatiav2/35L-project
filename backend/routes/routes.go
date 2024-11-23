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

	// query profiles
	r.HandleFunc("/profiles", handlers.GetUsersHandler).Methods("GET")
	r.HandleFunc("/profiles", handlers.PostUserHandler).Methods("POST")
	r.HandleFunc("/profiles", handlers.PatchUserHandler).Methods("PATCH")
	r.HandleFunc("/profiles", handlers.DeleteUserHandler).Methods("DELETE")

	// query availability
	r.HandleFunc("/availability", handlers.GetAvailabilityHandler).Methods("GET")
	r.HandleFunc("/availability", handlers.PostAvailabilityHandler).Methods("POST")
	r.HandleFunc("/availability", handlers.PutAvailabilityHandler).Methods("PUT")
	r.HandleFunc("/availability", handlers.DeleteAvailabilityHandler).Methods("DELETE")

	r.HandleFunc("/similarity", handlers.GetAvailableUsersHandler).Methods("GET")

	// sync with supabase
	r.HandleFunc("/webhooks/users", handlers.UserSyncWebhookHandler).Methods("POST")
	r.HandleFunc("/webhooks/users", handlers.UserSyncWebhookHandler).Methods("PUT")
	r.HandleFunc("/webhooks/users", handlers.UserSyncWebhookHandler).Methods("DELETE")

}
