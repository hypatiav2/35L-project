package handlers

import (
	"database/sql"
	"encoding/json"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"log"
	"net/http"

	_ "modernc.org/sqlite" // SQLite driver
)

func GetAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--GetAvailabilityHandler--") // logging all queries

	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := "1" // test user

	availability, err := models.GetAvailability(userID, db)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(availability)
}
