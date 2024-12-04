package models

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
)

// Return the similarity vector for a given user
func GetUserVector(userID string, db *sql.DB) ([]int, error) {
	var vectorJSON string

	// Query the vector as a JSON string
	err := db.QueryRow("SELECT vector FROM users WHERE id = ?", userID).Scan(&vectorJSON)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no vector found for user: %w", err)
		} else {
			return nil, fmt.Errorf("error querying user vector: %w", err)
		}

	}

	// turn the string into an array
	var vector []int
	err = json.Unmarshal([]byte(vectorJSON), &vector)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal vector JSON: %w", err)
	}

	// Return the array
	return vector, nil
}

// update similarity vector for the current user
func UpdateUserVector(vector []int, userID string, db *sql.DB) error {
	vectorJSON, err := json.Marshal(vector)
	if err != nil {
		return fmt.Errorf("failed to convert vector to JSON: %w", err)
	}

	_, err = db.Exec("UPDATE users SET vector = ? WHERE id = ?", vectorJSON, userID)
	if err != nil {
		return fmt.Errorf("failed to convert update user vector: %w", err)
	}

	return nil

}

/*
Get the vectors for a list of users, given their userIDs.

// TODO: SPLIT LIST INTO SMALLER CHUNKS WHEN BIG LISTS

Params:

	userIDs []string

Returns:

	map[string][]int
		Map from userID to corresponding vector
*/
func GetVectors(userIDs []string, db *sql.DB) (map[string][]int, error) {

	placeholders := make([]string, len(userIDs)) // query placeholder values
	args := make([]interface{}, len(userIDs))    // query actual values
	for i, id := range userIDs {
		placeholders[i] = "?"
		args[i] = id
	}

	// create a dynamic query with enough args for userIDs
	query := fmt.Sprintf(
		"SELECT id, vector FROM users WHERE id IN (%s)",
		strings.Join(placeholders, ","),
	)

	// Execute the query
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query user vectors: %w", err)
	}
	defer rows.Close()

	// Parse the results
	users := make(map[string][]int)
	for rows.Next() {
		var userID string
		var vectorJSON string
		if err := rows.Scan(&userID, &vectorJSON); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		// Decode the JSON vector field
		var vector []int
		if err := json.Unmarshal([]byte(vectorJSON), &vector); err != nil {
			return nil, fmt.Errorf("failed to unmarshal vector: %w", err)
		}

		users[userID] = vector
	}

	return users, nil
}
