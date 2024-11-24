package models

import "database/sql"

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

	// Call ComputeMatches

	// Take the top 50 matches and insert into matches table

	return nil
}

func GetMatches(userID string, db *sql.DB) ([]Match, error) {

	// Get all the matches for userID in the matches table

	return nil, nil
}

func ClearMatches(userID string, db *sql.DB) ([]Match, error) {

	// Clear all the matches for userID in the matches table

	return nil, nil
}
