package models

import (
	"database/sql"
	"fmt"
	"time"
)

// represent the scheduled_dates table
type Date struct {
	ID          int       `json:"id"`
	MatchID     int       `json:"match_id"`
	DateStart   time.Time `json:"date_start"`
	DateEnd     time.Time `json:"date_end"`
	IsConfirmed bool      `json:"is_confirmed"`
}

// PostDate inserts a new date into the database
func PostDate(date Date, db *sql.DB) (int, error) {
	query := `
		INSERT INTO scheduled_dates (match_id, date_start, date_end, is_confirmed)
		VALUES (?, ?, ?, ?)
	`

	// time.Time doesn't convert the time into ISO 8601 format by default, manually ensure correct format
	dateStart := date.DateStart.Format("2006-01-02T15:04:05Z")
	dateEnd := date.DateEnd.Format("2006-01-02T15:04:05Z")

	result, err := db.Exec(query, date.MatchID, dateStart, dateEnd, date.IsConfirmed)
	if err != nil {
		return -1, fmt.Errorf("failed to insert scheduled date: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return -1, fmt.Errorf("failed to fetch last insert id: %w", err)
	}

	return int(id), nil
}

// GetDate gets a date by its ID
func GetDate(id int, db *sql.DB) (*Date, error) {
	query := `
		SELECT id, match_id, date_start, date_end, is_confirmed
		FROM scheduled_dates
		WHERE id = ?
	`

	var date Date
	var dateStartStr, dateEndStr string // extract the date timestamps as strings

	err := db.QueryRow(query, id).Scan(
		&date.ID, &date.MatchID, &dateStartStr, &dateEndStr, &date.IsConfirmed,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("scheduled date with id %d not found", id)
		}
		return nil, fmt.Errorf("failed to retrieve scheduled date: %w", err)
	}

	// Convert date start and end strings to time.Time objects
	if dateStartStr != "" {
		date.DateStart, err = time.Parse(time.RFC3339, dateStartStr)
		if err != nil {
			fmt.Printf("Error parsing date_start: %v\n", err)
			return nil, fmt.Errorf("error parsing date_start: %w", err)
		}
	}
	if dateEndStr != "" {
		date.DateEnd, err = time.Parse(time.RFC3339, dateEndStr)
		if err != nil {
			fmt.Printf("Error parsing date_end: %v\n", err)
			return nil, fmt.Errorf("error parsing date_end: %w", err)
		}
	}

	return &date, nil
}

// GetDatesForMatch retrieves all scheduled dates for a specific match ID
func GetDatesForMatch(matchID int, db *sql.DB) ([]Date, error) {
	query := `
		SELECT id, match_id, date_start, date_end, is_confirmed
		FROM scheduled_dates
		WHERE match_id = ?
	`
	rows, err := db.Query(query, matchID)
	if err != nil {
		return nil, fmt.Errorf("failed to query scheduled dates: %w", err)
	}
	defer rows.Close()

	var dates []Date
	for rows.Next() {
		var date Date
		var dateStartStr, dateEndStr string // extract the date timestamps as strings

		// extract each row
		err := rows.Scan(&date.ID, &date.MatchID, &dateStartStr, &dateEndStr, &date.IsConfirmed)
		if err != nil {
			return nil, fmt.Errorf("error scanning row: %w", err)
		}

		// Convert date start and end strings to time.Time objects
		if dateStartStr != "" {
			date.DateStart, err = time.Parse(time.RFC3339, dateStartStr)
			if err != nil {
				fmt.Printf("Error parsing date_start: %v\n", err)
				return nil, fmt.Errorf("error parsing date_start: %w", err)
			}
		}
		if dateEndStr != "" {
			date.DateEnd, err = time.Parse(time.RFC3339, dateEndStr)
			if err != nil {
				fmt.Printf("Error parsing date_end: %v\n", err)
				return nil, fmt.Errorf("error parsing date_end: %w", err)
			}
		}

		dates = append(dates, date)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return dates, nil
}

// DeleteDate deletes a date from scheduled_dates by its id
func DeleteDate(dateID int, db *sql.DB) error {
	query := `DELETE FROM scheduled_dates WHERE id = ?`
	result, err := db.Exec(query, dateID)
	if err != nil {
		return fmt.Errorf("error deleting date: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no date found with ID %d", dateID)
	}

	return nil
}
