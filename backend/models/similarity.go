/*
Helper functions to find the similarity between users
*/

package models

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"sort"
	"strings"
	"errors"
)

/*
Find similarity between the current user and each user in the input list, and return a list of matches

Params:

	userIDs []string

Returns:

	map[string]float64
		map between each userID and their similarity to the current user
*/
func ComputeSimilarity(users []string, userID string, db *sql.DB) ([]Match, error) {

	// STEP 1. get vectors for users and current user: GetVectors

	vectors, err := GetVectors(users, db)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve vectors: %w", err)
	}

	currentUserVector, exists := vectors[userID]
	if !exists {
		return nil, fmt.Errorf("current user vector not found for user ID: %s", userID)
	}
	delete(vectors, userID) // Remove the current user from the comparison list

	// STEP 2. calculate similarity for each user: CosineSimilarity

	similarityScores := make(map[string]float64)
	for user2ID, vector := range vectors {
		similarityScores[user2ID] = CosineSimilarity(currentUserVector, vector)
	}

	// for key, value := range vectors {
	// 	vectors[key] = CosineSimilarity(value)
	// }

	// STEP 3. return a list of sorted matches

	// sortedScores := SortSimilarities(similarityScores)

	var sortedMatches []Match
	for user2ID, score := range similarityScores {
		// Create a Match for each user, where User1ID is the current user and User2ID is the other user
		match := Match{
			User1ID:    userID,
			User2ID:    user2ID,
			Similarity: score,
		}
		sortedMatches = append(sortedMatches, match)
	}

	// Sort the slice based on similarity score in descending order
	sort.Slice(sortedMatches, func(i, j int) bool {
		return sortedMatches[i].Similarity > sortedMatches[j].Similarity
	})

	return sortedMatches, nil
}

// calculates cosine similarity between two vectors (finds compatibility between two users)
func CosineSimilarity(vec1, vec2 []int) float64 {
	if len(vec1) != len(vec2) {
		return -1 // Error: mismatched vector lengths
	}

	var dotProduct, magnitudeA, magnitudeB float64
	for i := 0; i < len(vec1); i++ {
		dotProduct += float64(vec1[i] * vec2[i])
		magnitudeA += float64(vec1[i] * vec1[i])
		magnitudeB += float64(vec2[i] * vec2[i])
	}

	// Avoid division by zero
	if magnitudeA == 0 || magnitudeB == 0 {
		return 0
	}

	return dotProduct / (math.Sqrt(magnitudeA) * math.Sqrt(magnitudeB))
}
