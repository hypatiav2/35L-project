package models

import (
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt" // Import log package for logging
)

// User struct representing a user profile
type User struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Email          string  `json:"email"`
	Bio            string  `json:"bio"`
	Vector         *string `json:"vector"`
	ProfilePicture string  `json:"profile_picture"`
}

// GetAllUsers fetches alsl profiles from the database
func GetAllUsers(db *sql.DB) ([]User, error) {
	fmt.Printf("Fetching users from the database...\n") // Log to indicate function is called

	// Query to get all users and their profile information
	rows, err := db.Query("SELECT id, name, email, bio, vector, profile_picture FROM users")
	if err != nil {
		fmt.Printf("Error executing query: %v\n", err) // Log query error
		return nil, err
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		var profilePicture []byte

		err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Bio, &u.Vector, &profilePicture)
		if err != nil {
			fmt.Printf("Error scanning row: %v\n", err) // Log scanning error
			return nil, err
		}

		// Convert BLOB to base64 string
		u.ProfilePicture = base64.StdEncoding.EncodeToString(profilePicture)

		// Log each profile being added to the slice
		fmt.Printf("Fetched profile: %v\n", u)

		users = append(users, u)
	}

	// Log the total number of profiles fetched
	fmt.Printf("Total profiles fetched: %d\n\n", len(users))

	return users, nil
}

// GetUserByID fetches a single user profile from the database by ID
func GetUserByID(userID string, db *sql.DB) (User, error) {
	fmt.Printf("Fetching user with ID %s from the database...\n", userID) // Log to indicate function is called

	// Query to get the user's profile information
	row := db.QueryRow("SELECT id, name, email, bio, vector, profile_picture FROM users WHERE id = ?", userID)

	var u User
	var profilePicture []byte

	// Scan the row into the User struct
	err := row.Scan(&u.ID, &u.Name, &u.Email, &u.Bio, &u.Vector, &profilePicture)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Printf("No user found with ID %s\n", userID) // Log if no rows were returned
			return User{}, fmt.Errorf("user with ID %s not found", userID)
		}
		fmt.Printf("Error scanning user: %v\n", err) // Log scanning error
		return User{}, err
	}

	// Convert BLOB to base64 string
	u.ProfilePicture = base64.StdEncoding.EncodeToString(profilePicture)

	// Log the fetched profile
	fmt.Printf("Fetched user profile: %v\n", u)

	return u, nil
}

// post user to user table DOESNT POST VECTOR AND PROFILE PICTURE
func PostUser(user User, db *sql.DB) error {
	fmt.Printf("Posting user to the database...\n") // Log to indicate function is called
	stmt, err := db.Prepare(`
		INSERT INTO users (id, name, email, bio)
		VALUES (?, ?, ?, ?)
	`)
	if err != nil {
		fmt.Printf("Error posting user.")
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		user.ID,
		user.Name,
		user.Email,
		user.Bio,
	)
	return err
}

// update user information
func PatchUser(user User, db *sql.DB) error {
	// building the query
	query := "UPDATE users SET"
	var args []interface{}

	// Conditionally add fields to the query if they are non-empty
	if user.Name != "" {
		query += " name = ?,"
		args = append(args, user.Name)
	}
	if user.Email != "" {
		query += " email = ?,"
		args = append(args, user.Email)
	}
	if user.Bio != "" {
		query += " bio = ?,"
		args = append(args, user.Bio)
	}

	// If no fields were provided, error
	if len(args) == 0 {
		return errors.New("no valid fields to update")
	}

	// Remove last comma
	query = query[:len(query)-1]

	// Add the WHERE clause to specify which user to update
	query += " WHERE id = ?"
	args = append(args, user.ID)

	// Execute the query
	result, err := db.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
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

// DeleteAvailability deletes an user entry from the database.
func DeleteUser(userID string, db *sql.DB) error {
	// SQL query to delete the user entry
	query := `
		DELETE FROM users
		WHERE id = ?
	`

	// Execute the query
	result, err := db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	// Check if any rows were affected
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to fetch affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("no user found to delete; ensure the ID corresponds to a user")
	}

	return nil
}
