package repositories

import (
	// "fmt"
	"log"
)

// struct that represents a profile in our database TEMP RN NOT ACCURATE
type Profile struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// fetches a profile from the database based on userID
func GetProfileByUserID(userID string) (Profile, error) {
	log.Println("Getting a profile")
	return Profile{
		ID:    "123",
		Name:  "John Doe",
		Email: "john.doe@example.com",
	}, nil

	// actual implementation later
}
