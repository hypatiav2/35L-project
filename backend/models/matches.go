package models

import (
	"database/sql"
	"fmt"
	"sort"
)

const BATCH_SIZE = 50

type Match struct {
	ID         int     `json:"id"`
	User1ID    string  `json:"user1_id"`
	User2ID    string  `json:"user2_id"`
	DayOfWeek  string  `json:"day_of_week"`
	StartTime  string  `json:"start_time"`
	EndTime    string  `json:"end_time"`
	Similarity float64 `json:"similarity_score"`
	Status     *string `json:"match_status"`
}

// Compute all matches for a user, based on their availability and with an associated similarity score
func ComputeMatches(userID string, db *sql.DB) ([]Match, error) {

	// Step 1: Find users with overlapping availabilities
	userAvailabilities, err := GetAllAvailable(userID, db)
	if err != nil {
		fmt.Printf("Error finding users with overlapping availabilities: %v\n", err)
		return nil, err
	}

	// extract users
	var users []string
	for key := range userAvailabilities {
		users = append(users, key)
	}

	// Step 2: Compute similarities
	similarityScores, err := ComputeSimilarity(users, userID, db)
	if err != nil {
		fmt.Printf("Error computing similarities: %v\n", err)
		return nil, err
	}

	// Sort similarities by similarity score
	sort.Slice(similarityScores, func(i, j int) bool {
		return similarityScores[i].Score > similarityScores[j].Score // Sort in descending order
	})

	// create Match objects for each availability timeslot
	matches, err := createMatches(userID, similarityScores, userAvailabilities)
	if err != nil {
		fmt.Println("Error creating matches:", err)
		return nil, err
	}
	// Return list of match objects

	return matches, nil
}

// Given a base user, and a set of similarities and availabilities, create a list of Match objects between the base user and each availability in availabilities.
func createMatches(baseUser string, sortedSimilarities []Similarity, availabilities map[string][]Availability) ([]Match, error) {
	var matches []Match

	// Iterate over the sorted similarities
	for _, Similarity := range sortedSimilarities {
		userId := Similarity.UserID
		// Get the list of availabilities for each user
		usersAvailabilities, exists := availabilities[userId]
		if !exists {
			continue // skip user if no availabilities are found
		}

		// For each availability for this user, create a Match object
		for _, availability := range usersAvailabilities {
			match := Match{
				User1ID:    baseUser,
				User2ID:    availability.UserID,
				DayOfWeek:  availability.DayOfWeek,
				StartTime:  availability.StartTime,
				EndTime:    availability.EndTime,
				Similarity: Similarity.Score,
				Status:     nil,
			}

			// Append to matches list
			matches = append(matches, match)
		}
	}

	return matches, nil
}

// Update matches table, which stores the top BATCH_SIZE most similar matches for any given user
func UpdateMatches(userID string, db *sql.DB) error {

	// Clear old matches (if any)
	ClearMatches(userID, db)

	// Call ComputeMatches
	computedMatches, err := ComputeMatches(userID, db)
	if err != nil {
		return err
	}

	// Prepare query
	query := "INSERT INTO matches (user1_id, user2_id, similarity_score, match_status) VALUES (?, ?, ?, ?)"
	stmt, err := db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	// Take the top 50 matches and insert into matches table
	batch := min(len(computedMatches), BATCH_SIZE)
	for i := 0; i < batch; i++ {
		currentMatch := computedMatches[i]

		_, err = stmt.Exec(currentMatch.User1ID, currentMatch.User2ID, currentMatch.Similarity, currentMatch.Status)
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
	query := "DELETE FROM matches WHERE user1_id = ? OR user2_id = ?"

	_, err := db.Exec(query, userID, userID)
	if err != nil {
		fmt.Printf("failed to delete matches: %v", err)
		return err
	}

	return nil
}
