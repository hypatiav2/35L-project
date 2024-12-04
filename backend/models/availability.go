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
	query := "SELECT id, user_id, day_of_week, start_time, end_time FROM availability WHERE user_id = ?"

	// Query to get all users and their profile information
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var availabilities []Availability
	for rows.Next() {
		var a Availability

		err := rows.Scan(&a.ID, &a.UserID, &a.DayOfWeek, &a.StartTime, &a.EndTime)
		if err != nil {
			return nil, err
		}

		availabilities = append(availabilities, a)
	}

	return availabilities, nil
}

// post availability to availability table
func PostAvailability(availability Availability, db *sql.DB) error {
	stmt, err := db.Prepare(`
		INSERT INTO availability (user_id, day_of_week, start_time, end_time)
		VALUES (?, ?, ?, ?)
	`)
	if err != nil {
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

// Get any overlapping availability entries that both correspond to the same user
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

// Given a user, return a map of users who have overlapping availability with the provided user, and the corresponding Availabilities that are overlapping
func GetAllAvailable(userID string, db *sql.DB) (map[string][]Availability, error) {
	overlappingAvailabilities := make(map[string][]Availability)

	// Query availability table for entries that overlap
	overlapQuery := `
		SELECT 
			a.user_id,
			a.day_of_week,
			CASE 
				WHEN JULIANDAY(a.start_time) > JULIANDAY(b.start_time) THEN a.start_time 
				ELSE b.start_time 
			END AS overlap_start,
			CASE 
				WHEN JULIANDAY(a.end_time) < JULIANDAY(b.end_time) THEN a.end_time 
				ELSE b.end_time 
			END AS overlap_end
		FROM availability a
		JOIN availability b
			ON a.day_of_week = b.day_of_week
			AND JULIANDAY(a.start_time) < JULIANDAY(b.end_time)
			AND JULIANDAY(a.end_time) > JULIANDAY(b.start_time)
		WHERE b.user_id = ? 
		AND a.user_id != b.user_id;
	`

	// query the db
	overlapRows, err := db.Query(overlapQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get overlapping availability: %w", err)
	}
	defer overlapRows.Close()

	// append overlapping entries
	for overlapRows.Next() {
		var availability Availability

		if err := overlapRows.Scan(&availability.UserID, &availability.DayOfWeek, &availability.StartTime, &availability.EndTime); err != nil {
			return nil, fmt.Errorf("failed to scan overlapping user ID: %w", err)
		}
		overlappingAvailabilities[availability.UserID] = append(overlappingAvailabilities[availability.UserID], availability) // Insert userId into map if its unique (struct{}{} is an empty value)
	}

	if err := overlapRows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate over overlapping users: %w", err)
	}

	return overlappingAvailabilities, nil
}
