package models

import (
	"database/sql"
	"fmt"
)

const BATCH_SIZE = 50

type Match struct {
	ID         int     `json:"id"`
	User1ID    string  `json:"user1_id"`
	User2ID    string  `json:"user2_id"`
	Similarity float64 `json:"similarity_score"`
	Status     *string `json:"match_status"`
}

// Compute all matches for a user, based on their availability and with an associated similarity score
func ComputeMatches(userID string, db *sql.DB) ([]Match, error) {

	// Step 1: Fetch the user's availability and vector

	// Step 2: Find users with overlapping availabilities

	// Step 3: Compute similarities

	// Return list of match objects

	return nil, nil
}

// Update matches table, which stores the top BATCH_SIZE most similar matches for any given user
func UpdateMatches(userID string, db *sql.DB) error {

	// Clear old matches (if any) ClearMatches
	ClearMatches(userID, db)

	// Call ComputeMatches
	computedMatches, err := ComputeMatches(userID, db)
	if err != nil {
		return err
	}

	// Take the top 50 matches and insert into matches table
	for i := 0; i < BATCH_SIZE; i++ {
		currentMatch := computedMatches[i]

		query := "INSERT INTO matches (user1_id, user2_id, similarity_score, match_status) VALUES (?, ?, ?)"

		_, err = db.Exec(query, currentMatch.User1ID, currentMatch.User2ID, currentMatch.Similarity, currentMatch.Status)
		if err != nil {
			return err
		}
	}

	return nil
}

// Fetch all matches for userID in the matches table
func GetMatches(userID string, db *sql.DB) ([]Match, error) {

	query := "SELECT id, user1_id, user2_id, similarity_score, match_status FROM matches WHERE user1_id = ? OR user2_id = ?"

	rows, err := db.Query(query, userID, userID)
	if err != nil {
		fmt.Printf("error getting matches: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var matches []Match

	for rows.Next() {
		var match Match

		// Scan each row into a Match struct
		err := rows.Scan(&match.ID, &match.User1ID, &match.User2ID, &match.Similarity, &match.Status)
		if err != nil {
			fmt.Printf("error scanning row: %v\n", err)
			return nil, err
		}

		// Add the match to the slice
		matches = append(matches, match)
	}

	// Check for errors encountered during iteration
	if err := rows.Err(); err != nil {
		fmt.Printf("error iterating rows: %v\n", err)
		return nil, err
	}

	return matches, nil
}

// Clear all the matches for userID in the matches table
func ClearMatches(userID string, db *sql.DB) error {

	// SHOULD DELETE IF userID matches user1id OR user2id

	query := "DELETE FROM matches WHERE user1_id = ? OR user2_id = ?"
	_, err := db.Exec(query, userID)
	if err != nil {
		fmt.Printf("failed to delete matches: %v", err)
		return err
	}

	return nil
}
