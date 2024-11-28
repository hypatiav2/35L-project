package handlers

import {
	"database/sql"
	"encoding/json"
	"fmt"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"net/http"
}

// Return similarity vector for the current user
func GetVectorHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("--GetVectorHandler--") // logging all queries
	// db and userID from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	// query vector
	vector, err := models.GetUserVector(userID, db)
	if err != nil {
		http.Error(w, "Error getting user vector", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, writeErr := w.Write([]byte(vector))
	if writeErr != nil {
		log.Printf("Error writing response: %v\n", writeErr)
	}
}

// update similarity vector for the current user
func PutVectorHandler(w http.ResponseWriter, r *http.Request) {
	
	log.Println("--PutVectorHandler--") // logging all queries
	// db and userID from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	var vectorJSON string

	if err := json.NewDecoder(r.Body).Decode(&vectorJSON); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// query vector
	err := models.UpdateUserVector(vectorJSON, userID, db)
	if err != nil {
		http.Error(w, "Error updating user vector", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Vector updated successfully"))
}
