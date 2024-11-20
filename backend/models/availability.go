package models

import (
	"database/sql"
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

// GetProfiles fetches all profiles from the database
func GetAvailability(userID string, db *sql.DB) ([]Availability, error) {
	fmt.Printf("Fetching availability from the database...\n") // Log to indicate function is called
	query := "SELECT id, day_of_week, start_time, end_time FROM availability WHERE user_id = ?"

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

		err := rows.Scan(&a.ID, &a.DayOfWeek, &a.StartTime, &a.EndTime)
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
