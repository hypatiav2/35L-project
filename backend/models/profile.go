package models

import (
	"database/sql"
	"encoding/base64"
	"fmt" // Import log package for logging
)

// Profile struct representing a user profile
type Profile struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Email          string `json:"email"`
	Bio            string `json:"bio"`
	ProfilePicture string `json:"profile_picture"`
}

// GetProfiles fetches all profiles from the database
func GetProfiles(db *sql.DB) ([]Profile, error) {
	fmt.Printf("Fetching profiles from the database...\n") // Log to indicate function is called

	// Query to get all users and their profile information
	rows, err := db.Query("SELECT id, name, email, bio, profile_picture FROM users")
	if err != nil {
		fmt.Printf("Error executing query: %v\n", err) // Log query error
		return nil, err
	}
	defer rows.Close()

	var profiles []Profile
	for rows.Next() {
		var p Profile
		var profilePicture []byte

		err := rows.Scan(&p.ID, &p.Name, &p.Email, &p.Bio, &profilePicture)
		if err != nil {
			fmt.Printf("Error scanning row: %v\n", err) // Log scanning error
			return nil, err
		}

		// Convert BLOB to base64 string
		p.ProfilePicture = base64.StdEncoding.EncodeToString(profilePicture)

		// Log each profile being added to the slice
		fmt.Printf("Fetched profile: %v\n", p)

		profiles = append(profiles, p)
	}

	// Log the total number of profiles fetched
	fmt.Printf("Total profiles fetched: %d\n\n", len(profiles))

	return profiles, nil
}
