package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"go-react-backend/models"
	_ "modernc.org/sqlite" // SQLite driver
)

// GetProfilesHandler handles the /api/profiles route
func GetProfilesHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("GetProfilesHandler called ") // Log query error
	// Open DB connection
	db, err := sql.Open("sqlite", "./bdate.db")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Fetch profiles from the database
	profiles, err := models.GetProfiles(db)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond with profiles as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profiles)
}
