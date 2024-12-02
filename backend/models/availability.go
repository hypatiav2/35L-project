package models

import (
	"database/sql"
	"errors"
	"fmt"
)

// Profile struct representing a user profile
type Availability struct {
	ID        int    `json:"id"`
	UserID    string `json:"user_id"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	DayOfWeek string `json:"day_of_week"`
}

// fetches all availabilities for UserID from the database
func GetAvailability(userID string, db *sql.DB) ([]Availability, error) {
	fmt.Printf("Fetching availability from the database...\n") // Log to indicate function is called
	query := "SELECT id, user_id, day_of_week, start_time, end_time FROM availability WHERE user_id = ?"

	// Query to get all users and their profile information
	rows, err := db.Query(query, userID)
	if err != nil {
		fmt.Printf("Error executing query: %v\n", err) // Log query error
		return nil, err
	}
	defer rows.Close()

	var availabilities []Availability
	for rows.Next() {
		var a Availability

		err := rows.Scan(&a.ID, &a.UserID, &a.DayOfWeek, &a.StartTime, &a.EndTime)
		if err != nil {
			fmt.Printf("Error scanning row: %v\n", err) // Log scanning error
			return nil, err
		}

		// Log each availability being added to the slice
		fmt.Printf("Fetched availability: %v\n", a)

		availabilities = append(availabilities, a)
	}

	// Log the total number of profiles fetched
	fmt.Printf("Total profiles fetched: %d\n\n", len(availabilities))

	return availabilities, nil
}

// post availability to availability table
func PostAvailability(availability Availability, db *sql.DB) error {
	fmt.Printf("Posting availability to the database...\n") // Log to indicate function is called
	stmt, err := db.Prepare(`
		INSERT INTO availability (user_id, day_of_week, start_time, end_time)
		VALUES (?, ?, ?, ?)
	`)
	if err != nil {
		fmt.Printf("Error posting availability.")
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		availability.UserID,
		availability.DayOfWeek,
		availability.StartTime,
		availability.EndTime,
	)
	return err
}

// update availability to a timeslot
func PutAvailability(availability Availability, db *sql.DB) error {
	// Ensure the availability ID is provided
	if availability.ID == -1 {
		return errors.New("availability ID is required for update")
	}

	// SQL query to update the availability
	query := `
		UPDATE availability
		SET day_of_week = ?, start_time = ?, end_time = ?
		WHERE id = ? AND user_id = ?
	`

	// Execute the query
	result, err := db.Exec(query, availability.DayOfWeek, availability.StartTime, availability.EndTime, availability.ID, availability.UserID)
	if err != nil {
		return fmt.Errorf("failed to update availability: %w", err)
	}

	// Check if any rows were affected
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to fetch rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("no rows were updated; ensure the ID and user ID match")
	}

	return nil
}

// DeleteAvailability deletes an availability entry from the database.
func DeleteAvailability(id int, userID string, db *sql.DB) error {
	// SQL query to delete the availability entry
	query := `
		DELETE FROM availability
		WHERE id = ? AND user_id = ?
	`

	// Execute the query
	result, err := db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete availability: %w", err)
	}

	// Check if any rows were affected
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to fetch affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("no availability found to delete; ensure the ID corresponds to an entry for the current user")
	}

	return nil
}

// check for overlapping availability entries for a particular user
func GetOverlapping(availability Availability, db *sql.DB) (*Availability, error) {
	query := `
		SELECT id, user_id, day_of_week, start_time, end_time
		FROM availability
		WHERE user_id = ?
		AND day_of_week = ?
		AND (? < end_time AND ? > start_time)
		LIMIT 1
	`
	// check table for overlapping timeslot
	var overlap Availability
	err := db.QueryRow(query, availability.UserID, availability.DayOfWeek, availability.StartTime, availability.EndTime).
		Scan(&overlap.ID, &overlap.UserID, &overlap.DayOfWeek, &overlap.StartTime, &overlap.EndTime)

	if err == sql.ErrNoRows {
		return nil, nil // No overlap
	} else if err != nil {
		return nil, err // Query error
	}

	return &overlap, nil // overlap found
}

// Given a user, return a list of all users who have overlapping availability
func GetAllAvailable(userID string, db *sql.DB) ([]string, error) {
	var availableUsers []string

	// Query availability table for entries that overlap

	overlapQuery := `
		SELECT DISTINCT a.user_id
		FROM availability a
		JOIN availability b
		ON a.day_of_week = b.day_of_week
		AND a.start_time < b.end_time
		AND a.end_time > b.start_time
		WHERE b.user_id = ? AND a.user_id != b.user_id
	`

	// query the db
	overlapRows, err := db.Query(overlapQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get overlapping availability: %v", err)
	}
	defer overlapRows.Close()

	// append overlapping entries
	for overlapRows.Next() {
		var otherUserID string
		if err := overlapRows.Scan(&otherUserID); err != nil {
			return nil, fmt.Errorf("failed to scan overlapping user ID: %v", err)
		}
		availableUsers = append(availableUsers, otherUserID)
	}

	if err := overlapRows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate over overlapping users: %v", err)
	}

	return availableUsers, nil
}
