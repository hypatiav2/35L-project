package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"log"
	"math"
	"net/http"
)

// store a user and their similarity to current user
type Similarity struct {
	User       models.User `json:"user"`
	Similarity float64     `json:"similarity"`
}

/*
GET all users who have overlapping availability with current user.

Returns:

	"user": <user_struct_as_json>
	"similarity": <similarity_score>
*/
func GetAvailableUsersHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--GetAvailableUsersHandler--") // logging all queries
	// db and userID from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	// get all users who have overlapping availability
	// GETALLAVAILABLE NOT IMPLEMENTED (implement in handlers/availability)
	users, err := models.GetAllAvailable(userID, db)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// create a sorted list of users with their similarities as well
	sortedUsers, err := SortBySimilarity(users)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sortedUsers)
}

/*
Find similarity between current user and users in the supplied list, and return in sorted order.

Returns:
List of

	"user": <user_struct_as_json>
	"similarity": <similarity_score>
*/
func SortBySimilarity(users []models.User) ([]Similarity, error) {

	// IMPLEMENT
	return nil, nil
}

/*
Compute cosine similarity between two vectors

Params: two float64 vectors

Returns: a float value representing their similarity
*/
func CalculateCosineSimilarity(vec1, vec2 []float64) float64 {
	// Check if vectors are the same length
	if len(vec1) != len(vec2) {
		fmt.Println("Error: Vectors must have the same length")
		return 0
	}

	// Compute dot product of vec1 and vec2
	dotProduct := 0.0
	for i := 0; i < len(vec1); i++ {
		dotProduct += vec1[i] * vec2[i]
	}

	// Compute magnitudes of vec1 and vec2
	magnitudeVec1 := 0.0
	magnitudeVec2 := 0.0
	for i := 0; i < len(vec1); i++ {
		magnitudeVec1 += vec1[i] * vec1[i]
		magnitudeVec2 += vec2[i] * vec2[i]
	}

	magnitudeVec1 = math.Sqrt(magnitudeVec1)
	magnitudeVec2 = math.Sqrt(magnitudeVec2)

	// Compute cosine similarity
	if magnitudeVec1 == 0 || magnitudeVec2 == 0 {
		return 0
	}
	return dotProduct / (magnitudeVec1 * magnitudeVec2)
}
