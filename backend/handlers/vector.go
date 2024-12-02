package handlers

import (
	"database/sql"
	"encoding/json"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"log"
	"net/http"
)

/*
GET /api/v1/vector: gets the similarity vector for the current user.

Returns:

	200 OK: Successful fetch
		{
			"similarity_vector": <json array of ints that is the similarity vector>
		}
	500 INTERNAL ERROR: Could not fetch user vector
*/
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

	// Create a response struct
	response := struct {
		SimilarityVector []int `json:"similarity_vector"`
	}{SimilarityVector: vector}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error writing response: %v\n", err)
		http.Error(w, "Failed to process response", http.StatusInternalServerError)
	}
}

/*
PUT /api/v1/vector: Inserts or updates the similarity vector for the current user.

Request Body:

	{
	    "similarity_vector": <[json array of ints]>
	}

Returns:

	200 OK: Successful update
	400 BAD REQUEST: response body was not formatted correctly
	500 INTERNAL ERROR: Could not update
*/
func PutVectorHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("--PutVectorHandler--") // logging all queries
	// db and userID from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	var requestBody struct {
		Vector []int `json:"similarity_vector"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// query vector
	err := models.UpdateUserVector(requestBody.Vector, userID, db)
	if err != nil {
		http.Error(w, "Error updating user vector", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Vector updated successfully"))
}
