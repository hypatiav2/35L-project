package models

import (
	"database/sql"
	"fmt"
)

// represent the scheduled_dates table
type Date struct {
	ID        int    `json:"id"`
	User1ID   string `json:"user1_id"`
	User2ID   string `json:"user2_id"`
	DateStart string `json:"date_start"`
	DateEnd   string `json:"date_end"`
	Status    string `json:"status"`
}

// GetDate gets a date by its ID
func GetDate(id int, db *sql.DB) (*Date, error) {
	query := `
		SELECT id, user1_id, user2_id, date_start, date_end, status
		FROM scheduled_dates
		WHERE id = ?
	`

	var date Date

	err := db.QueryRow(query, id).Scan(
		&date.ID, &date.User1ID, &date.User2ID, &date.DateStart, &date.DateEnd, &date.Status,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("scheduled date with id %d not found", id)
		}
		return nil, fmt.Errorf("failed to retrieve scheduled date: %w", err)
	}

	return &date, nil
}

// GetDates retrieves all dates matching status for the provided user
func GetDates(userID string, status string, db *sql.DB) ([]Date, error) {
	// build query with optional status
	var query string
	var params []interface{}
	if IsValidStatus(status) {
		query = `
			SELECT id, user1_id, user2_id, date_start, date_end, status
			FROM scheduled_dates
			WHERE (user1_id = ? OR user2_id = ?) AND status = ?
		`
		params = []interface{}{userID, userID, status}
	} else {
		query = `
			SELECT id, user1_id, user2_id, date_start, date_end, status
			FROM scheduled_dates
			WHERE user1_id = ? OR user2_id = ? 
		`
		params = []interface{}{userID, userID}
	}

	// query table
	rows, err := db.Query(query, params...)
	if err != nil {
		return nil, fmt.Errorf("failed to query scheduled dates: %w", err)
	}
	defer rows.Close()

	var dates []Date
	for rows.Next() {
		var date Date

		// extract each row
		err := rows.Scan(&date.ID, &date.User1ID, &date.User2ID, &date.DateStart, &date.DateEnd, &date.Status)
		if err != nil {
			return nil, fmt.Errorf("error scanning row: %w", err)
		}

		// add to list
		dates = append(dates, date)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return dates, nil
}

// PostDate inserts a new date into the database
func PostDate(date Date, db *sql.DB) (int, error) {
	query := `
		INSERT INTO scheduled_dates (user1_id, user2_id, date_start, date_end, status)
		VALUES (?, ?, ?, ?, ?)
	`

	result, err := db.Exec(query, date.User1ID, date.User2ID, date.DateStart, date.DateEnd, date.Status)
	if err != nil {
		return -1, fmt.Errorf("failed to insert scheduled date: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return -1, fmt.Errorf("failed to fetch last insert id: %w", err)
	}

	return int(id), nil
}

func PatchDate(dateID int, status string, db *sql.DB) error {
	query := `
        UPDATE scheduled_dates
        SET status = ?
        WHERE id = ?;
    `

	// Execute the query with the provided dateID and newStatus
	result, err := db.Exec(query, status, dateID)
	if err != nil {
		return fmt.Errorf("error updating status: %w", err)
	}

	// Optional: Check how many rows were affected
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error fetching rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no rows updated, check if the dateID exists")
	}

	return nil
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

// validate status
func IsValidStatus(status string) bool {
	switch status {
	case "pending":
		return true
	case "confirmed":
		return true
	case "rejected":
		return true
	default:
		return false
	}
}
