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
}

type UserMatches struct {
	User1ID        string         `json:"user1_id"`
	User2ID        string         `json:"user2_id"`
	Similarity     float64        `json:"similarity_score"`
	Availabilities []Availability `json:"availabilities"`
}

// Compute all matches for a user, based on their availability and with an associated similarity score
func ComputeMatches(userID string, db *sql.DB) ([]UserMatches, error) {

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
	matches, err := createUserMatches(userID, similarityScores, userAvailabilities)
	if err != nil {
		fmt.Println("Error adding availabilities to user matches:", err)
		return nil, err
	}
	// Return list of match objects

	return matches, nil
}

// Given a base user, and a set of similarities and availabilities, create a list of Match objects between the base user and each availability in availabilities.
func createUserMatches(baseUser string, sortedSimilarities []Similarity, availabilities map[string][]Availability) ([]UserMatches, error) {
	var matches []UserMatches

	// Iterate over the sorted similarities
	for _, Similarity := range sortedSimilarities {
		userID := Similarity.UserID
		// Get the list of availabilities for each user
		usersAvailabilities, exists := availabilities[userID]
		if !exists {
			continue // skip user if no availabilities are found
		}

		match := UserMatches{
			User1ID:        baseUser,
			User2ID:        userID,
			Similarity:     Similarity.Score,
			Availabilities: usersAvailabilities,
		}

		// Append to matches list
		matches = append(matches, match)
	}
	return matches, nil
}

// Update matches table, which stores the top BATCH_SIZE most similar matches for any given user
func UpdateMatches(userID string, db *sql.DB) error {

	// Clear old matches (if any)
	ClearMatches(userID, db)

	// Call ComputeMatches
	computedUserMatches, err := ComputeMatches(userID, db)
	if err != nil {
		return err
	}
	matches := matchFromUserMatches(computedUserMatches)

	// Prepare query
	query := "INSERT INTO matches (user1_id, user2_id, day_of_week, start_time, end_time, similarity_score) VALUES (?, ?, ?, ?, ?)"
	stmt, err := db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	// Take the top 50 matches and insert into matches table
	batch := min(len(matches), BATCH_SIZE)
	for i := 0; i < batch; i++ {

		currentMatch := matches[i]

		_, err = stmt.Exec(currentMatch.User1ID, currentMatch.User2ID, currentMatch.DayOfWeek, currentMatch.StartTime, currentMatch.EndTime, currentMatch.Similarity)
		if err != nil {
			return err
		}
	}

	return nil
}

// Fetch all matches for userID in the matches table
func GetMatches(userID string, db *sql.DB) ([]UserMatches, error) {

	query := "SELECT id, user1_id, user2_id, day_of_week, start_time, end_time, similarity_score FROM matches WHERE user1_id = ? OR user2_id = ?"

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
		err := rows.Scan(&match.ID, &match.User1ID, &match.User2ID, &match.DayOfWeek, &match.StartTime, &match.EndTime, &match.Similarity)
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

	return userMatchesFromMatch(matches), nil
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

func matchFromUserMatches(userMatches []UserMatches) []Match {
	var matches []Match

	// Iterate through each UserMatches
	for _, um := range userMatches {
		// For each availability of the user match, create a new Match object
		for _, availability := range um.Availabilities {
			match := Match{
				User1ID:    um.User1ID,
				User2ID:    um.User2ID,
				DayOfWeek:  availability.DayOfWeek,
				StartTime:  availability.StartTime,
				EndTime:    availability.EndTime,
				Similarity: um.Similarity,
			}

			// Append the new match to the matches slice
			matches = append(matches, match)

			// Increment the match ID for the next match
		}
	}

	return matches
}

func userMatchesFromMatch(matches []Match) []UserMatches {
	userMatchesMap := make(map[string]*UserMatches)

	// Iterate through the matches and group them by User2ID
	for _, match := range matches {
		// If the User2ID is not already in the map, initialize it
		if _, exists := userMatchesMap[match.User2ID]; !exists {
			userMatchesMap[match.User2ID] = &UserMatches{
				User1ID:    match.User1ID,
				User2ID:    match.User2ID,
				Similarity: match.Similarity,
			}
		}

		// Add the availability to the corresponding UserMatches entry
		userMatchesMap[match.User2ID].Availabilities = append(
			userMatchesMap[match.User2ID].Availabilities,
			Availability{
				UserID:    match.User2ID,
				StartTime: match.StartTime,
				EndTime:   match.EndTime,
				DayOfWeek: match.DayOfWeek,
			},
		)
	}

	// Convert the map to a slice
	var userMatchesList []UserMatches
	for _, um := range userMatchesMap {
		userMatchesList = append(userMatchesList, *um)
	}

	return userMatchesList
}
