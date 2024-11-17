package routes

import (
	"go-react-backend/controllers"
	"go-react-backend/middlewares"
	"net/http"

	"github.com/gorilla/mux"
)

// register our routes and wrap them with auth middleware
// right now implementing controllers.ProfileController as functions, so they need to be wrapped by a handler. find a better way of doing it?
func RegisterRoutes(r *mux.Router) {
	r.Handle("/profile", middlewares.AuthMiddleware(http.HandlerFunc(controllers.ProfileController))).Methods("GET")
	r.Handle("/protected", middlewares.AuthMiddleware(http.HandlerFunc(controllers.PublicRoute))).Methods("GET")
	r.HandleFunc("/", controllers.PublicRoute).Methods("GET")
}
