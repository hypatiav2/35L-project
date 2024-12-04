/*
Helper functions to find the similarity between users
*/

package models

import (
	"database/sql"
	"fmt"
	"math"
)

type Similarity struct {
	UserID string
	Score  float64
}

/*
Find similarity between the current user and each user in the input list, and return a list of matches

Params:

	userIDs []string

Returns:

	map[string]float64
		map between each userID and their similarity to the current user
*/
func ComputeSimilarity(users []string, userID string, db *sql.DB) ([]Similarity, error) {

	// STEP 1. get vectors for users and current user: GetVectors

	vectors, err := GetVectors(users, db)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve vectors: %w", err)
	}

	currentUserVector, err := GetUserVector(userID, db)
	if err != nil {
		return nil, fmt.Errorf("vector not found for current user ID: %s", userID[:8])
	}

	delete(vectors, userID) // If users also includes the current user

	// STEP 2. calculate similarity for each user: CosineSimilarity
	var similarityScores []Similarity
	for user2ID, vector := range vectors {
		score := CosineSimilarity(currentUserVector, vector)
		if score == -1 {
			// check for mismatched vectors
			return nil, fmt.Errorf("found a vector of the wrong length: %d", len(vector))
		} else {
			var similarity Similarity
			similarity.UserID = user2ID
			similarity.Score = score
			similarityScores = append(similarityScores, similarity)
		}
	}

	// STEP 3. return a list of sorted matches

	// var sortedMatches []Match
	// for user2ID, score := range similarityScores {
	// 	// Create a Match for each user, where User1ID is the current user and User2ID is the other user
	// 	match := Match{
	// 		User1ID:    userID,
	// 		User2ID:    user2ID,
	// 		Similarity: score,
	// 	}
	// 	sortedMatches = append(sortedMatches, match)
	// }

	// // Sort the vector based on similarity score in descending order
	// sort.Slice(sortedMatches, func(i, j int) bool {
	// 	return sortedMatches[i].Similarity > sortedMatches[j].Similarity
	// })

	return similarityScores, nil
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
