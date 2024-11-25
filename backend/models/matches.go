package models

import (
	"database/sql"
	"errors"
	"fmt"
)

const BATCH_SIZE = 50

type Match struct {
	User1ID    string `json:"user1_id"`
	User2ID    string `json:"user2_id"`
	Similarity int    `json:"similarity_score"`
	Status     string `json:"match_status"`
}

func ComputeMatches(userID string, db *sql.DB) ([]Match, error) {

	// Step 1: Fetch the user's availability and vector

	// Step 2: Find users with overlapping availabilities

	// Step 3: Compute similarities

	// Return list of match objects

	return nil, nil
}

func UpdateMatches(userID string, db *sql.DB) error {

	// Clear old matches (if any) ClearMatches
	ClearMatches(userID, db)

	// Call ComputeMatches
	computedMatches := ComptueMatches(userID, db)

	// Take the top 50 matches and insert into matches table
	for i := 0; i < BATCH_SIZE; i++ {
		currentMatch = computedMatches[i]

		stmt, err := db.Prepare("INSERT INTO matches (user1id, user2id, similarity_score, match_status) VALUES (?, ?, ?)")
		if err != nil {
			return err
		}

		_, err := stmt.Exec(currentMatch.User1ID, currentMatch.User2ID, currentMatch.Similarity, currentMatch.Status)
		if err != nil {
			return err
		}
	}

	return nil
}

func GetMatches(userID string, db *sql.DB) ([]Match, error) {

	// Get all the matches for userID in the matches table

	query := dp.Prepare("SELECT user1id, user2id, similarity_score, match_status FROM matches WHERE user1id = ?")
	rows, err := db.Query(query, userID)
	if err != nil {
		fmt.Printf("error getting matches: %v\n", err)
		return nil, err
	}

	return rows, nil
}

// Clear all the matches for userID in the matches table
func ClearMatches(userID string, db *sql.DB) ([]Match, error) {

	queryDelete := "DELETE FROM matches WHERE user_id = ?"
	result, err := db.Exec(queryDelete, userID)
	if err != nil {
		fmt.Printf("failed to delete matches: %v", err)
		return nil, err
	}

	return nil, nil
}
