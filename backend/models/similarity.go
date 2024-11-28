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
func ComputeSimilarity(currentUserID string, users []string, db *sql.DB) (map[string]float64, error) {

	// STEP 1. get vectors for users and current user: GetVectors

	vectors, err := GetVectors(users, db)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve vectors: %w", err)
	}

	currentUserVector, exists := vectors[currentUserID]
	if !exists {
		return nil, fmt.Errorf("current user vector not found for user ID: %s", currentUserID)
	}
	delete(vectors, currentUserID) // Remove the current user from the comparison list

	// STEP 2. calculate similarity for each user: CosineSimilarity

	similarityScores := make(map[string]float64)
	for userID, vector := range vectors {
		similarityScores[userID] = CosineSimilarity(currentUserVector, vector)
	}

	// for key, value := range vectors {
	// 	vectors[key] = CosineSimilarity(value)
	// }

	// STEP 3. return a list of sorted matches

	sortedScores := SortSimilarities(similarityScores)
	return sortedScores, nil
}

func SortSimilarities(similarityScores map[string]float64) map[string]float64 {
	// Create a slice of keys and sort by scores
	type kv struct {
		Key   string
		Value float64
	}
	var sortedList []kv
	for k, v := range similarityScores {
		sortedList = append(sortedList, kv{k, v})
	}
	sort.Slice(sortedList, func(i, j int) bool {
		return sortedList[i].Value > sortedList[j].Value // Descending order
	})

	// Create a sorted map
	sortedScores := make(map[string]float64)
	for _, item := range sortedList {
		sortedScores[item.Key] = item.Value
	}
	return sortedScores
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
