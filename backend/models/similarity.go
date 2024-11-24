/*
Helper functions to find the similarity between users
*/

package models

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"strings"
)

/*
Find similarity between the current user and each user in the input list, and return a list of matches

Params:

	userIDs []string

Returns:

	map[string]float64
		map between each userID and their similarity to the current user
*/
func ComputeSimilarity(users []string) (map[string]float64, error) {

	// STEP 1. get vectors for users and current user: GetUserVectors

	// STEP 2. calculate similarity for each user: CalculateCosineSimilarity

	// STEP 3. return a list of sorted matches

	return nil, nil
}

/*
Get the vectors for a list of users, given their userIDs.

// TODO: SPLIT LIST INTO SMALLER CHUNKS WHEN BIG LISTS

Params:

	userIDs []string

Returns:

	map[string][]float64
		Map from userID to corresponding vector
*/
func GetVectors(userIDs []string, db *sql.DB) (map[string][]float64, error) {
	// Build a dynamic query with placeholders
	placeholders := make([]string, len(userIDs))
	args := make([]interface{}, len(userIDs))
	for i, id := range userIDs {
		placeholders[i] = "?"
		args[i] = id
	}
	query := fmt.Sprintf(
		"SELECT id, similarity_vector FROM users WHERE id IN (%s)",
		strings.Join(placeholders, ","),
	)

	// Execute the query
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query user vectors: %w", err)
	}
	defer rows.Close()

	// Parse the results
	vectors := make(map[string][]float64)
	for rows.Next() {
		var userID string
		var vectorJSON string
		if err := rows.Scan(&userID, &vectorJSON); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		// Decode the JSON vector field
		var vector []float64
		if err := json.Unmarshal([]byte(vectorJSON), &vector); err != nil {
			return nil, fmt.Errorf("failed to unmarshal vector: %w", err)
		}

		vectors[userID] = vector
	}

	return vectors, nil
}

/*
Compute cosine similarity between two vectors

Params: two float64 vectors

Return: a float value representing their similarity
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
