package controllers

import (
	"encoding/json"
	"fmt"
	"go-react-backend/repositories"
	"net/http"
)

// Logic for a basic get route to our db (public.profiles) -> finds profile corresponding to userID, which should be stored in the request context once implemented
func ProfileController(w http.ResponseWriter, r *http.Request) {
	userID := "something" // extract from JWT claims once we implement storing userID in request context

	// fetch profile from the database (handled in repositories/profile_repository.go)
	profile, err := repositories.GetProfileByUserID(userID)
	if err != nil {
		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}

	// Respond with the profile json data
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

// Logic for our test route to root endpoint
func PublicRoute(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"message": "You have access to the public route!"}`)
}

// Logic for our test route that includes authentication (authentication is dealt with in routes/routes.go)
func ProtectedRoute(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"message": "You have access to the protected route!"}`)
}
