package routes

import (
	"go-react-backend/controllers"
	"go-react-backend/middleware"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
)

// register our routes
// implementing controllers as functions rn, so they need to be wrapped by a handler. maybe find a better way of doing it?
func RegisterRoutes(r *mux.Router, connPool *pgxpool.Pool) {
	// Add connection pooling middleware -> route handlers can access the connection to our db
	r.Use(middleware.ConnPoolMiddleware(connPool))

	// TESTER ROUTES
	r.Handle("/protected", middleware.AuthMiddleware(http.HandlerFunc(controllers.PublicRoute))).Methods("GET")
	r.HandleFunc("/", controllers.PublicRoute).Methods("GET")

	// PROFILE ROUTES
	r.Handle("/profile", middleware.AuthMiddleware(http.HandlerFunc(controllers.ProfileController))).Methods("GET")

	// AVAILABILITY ROUTES
	r.Handle("/availability", middleware.AuthMiddleware(http.HandlerFunc(controllers.GetAvailability))).Methods("GET")
	r.Handle("/availability", middleware.AuthMiddleware(http.HandlerFunc(controllers.InsertAvailability))).Methods("POST")
}
