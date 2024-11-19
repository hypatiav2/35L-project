package repositories

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Schedule struct {
	UserID    string             `json:"user_id"`
	TimeSlots []pgtype.Tstzrange `json:"time_slots"`
}

/*
GetAvailabilityForUserID retrieves the availability time slots for a given user.
It queries the availability table for a user by their userID and returns a list of time slots
in the form of a Schedule struct.

Parameters:

	userID (string): The unique ID of the user whose availability is being queried.
	connPool (*pgxpool.Pool): The connection pool to the PostgreSQL database.

Returns:

	Schedule: A struct containing the userID and a list of time slots (Tstzrange) representing the user's availability.
	error: An error if the query or scanning fails, otherwise nil.
*/
func GetAvailabilityForUserID(userID string, connPool *pgxpool.Pool) (Schedule, error) {
	// Our sql query
	query := `SELECT duration FROM availability WHERE user_id = $1`

	rows, err := connPool.Query(context.Background(), query, userID)
	if err != nil {
		return Schedule{}, fmt.Errorf("failed to query availability: %w", err)
	}
	defer rows.Close()

	// store a list of available timeslots
	var timeSlots []pgtype.Tstzrange

	// process each row
	for rows.Next() {
		var duration pgtype.Tstzrange
		err := rows.Scan(&duration)
		if err != nil {
			// Log the error for debugging purposes
			log.Printf("Error scanning row for user %s: %v\n", userID, err)
			continue // Skip this row if it fails to scan
		}

		log.Println(duration)
		// Ensure the range has both lower and upper bounds before appending
		if duration.Status == pgtype.Present &&
			duration.Lower.Status == pgtype.Present &&
			duration.Upper.Status == pgtype.Present {
			timeSlots = append(timeSlots, duration)
		} else {
			// Log invalid ranges and continue
			log.Printf("Skipping invalid range for user %s: %v\n", userID, duration)
		}
	}

	// Create and return our Schedule struct.
	return Schedule{
		UserID:    userID,
		TimeSlots: timeSlots,
	}, nil
}

/*
InsertAvailability inserts a new availability time slot for a user into the availability table.
The function accepts a userID and a timeSlot (in tstzrange format) and stores them in the database.

Parameters:

	userID (string): The unique ID of the user whose availability is being inserted.
	timeSlot (pgtype.Tstzrange): The time slot that represents the user's availability.
	connPool (*pgxpool.Pool): The connection pool to the PostgreSQL database.

Returns:

	error: An error if the insertion fails, otherwise nil.
*/
func InsertAvailability(userID string, timeSlot pgtype.Tstzrange, connPool *pgxpool.Pool) error {
	query := `INSERT INTO availability (user_id, duration) VALUES ($1, $2)`

	// Execute the query with the provided userID and timeSlot
	_, err := connPool.Exec(context.Background(), query, userID, timeSlot) //momentarily disable
	if err != nil {
		return fmt.Errorf("failed to insert availability: %w", err)
	}

	return nil
}
