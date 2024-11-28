package models

import (
	"database/sql"
	"errors"
	"fmt"
)

// Return similarity vector for given user
func GetUserVector(userID string, db *sql.DB) (string, error) {
	var vectorJSON string

	// Query the vector as a JSON string
	err := db.QueryRow("SELECT vector FROM users WHERE id = ?", userID).Scan(&vectorJSON)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Printf("No user found with ID: %s\n", userID)
		} else {
			fmt.Printf("Error querying user vector: %v\n", err)
		}
		return "", err
	}

	// Return the JSON string
	return vectorJSON, nil
}

// update similarity vector for the current user
func UpdateUserVector(vectorJSON string, userID string, db *sql.DB) error {

	_, err := db.Exec("UPDATE users SET vector = ? WHERE id = ?", vectorJSON, userID)
	if err != nil {
		fmt.Printf("Error updating user vector.")
		return err
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
	// Build a dynamic query with placeholders
	placeholders := make([]string, len(userIDs))
	args := make([]interface{}, len(userIDs))
	for i, id := range userIDs {
		placeholders[i] = "?"
		args[i] = id
	}
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
	vectors := make(map[string][]int)
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

		vectors[userID] = vector
	}

	return vectors, nil
}