package handlers

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "modernc.org/sqlite" // SQLite driver
)

/*
GET /api/v1/users: Retrieves a list of all users.

Return:

	200 OK: Returns a JSON array of users
	[
		{
			"id": <unique id for the user> STRING
			"name": <user's name> STRING
			"email": <user's UNIQUE email> STRING
			"bio": <user's bio> STRING
			"vector": <user's similarity vector> STRING
			"profile_picture": <base64-encoded image string, currently empty> STRING
		},
		...
	]

	500 INTERNAL ERROR: Returns an error message if the server is unable to retrieve users from the database.
*/
func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	// Fetch users from the database
	users, err := models.GetAllUsers(db)
	if err != nil {
		log.Printf("Failed retrieving all users: %v\n", err)
		http.Error(w, "Error retrieving all users", http.StatusInternalServerError)
		return
	}

	// Respond with user as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func GetCurrentUserHandler(w http.ResponseWriter, r *http.Request) {
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userId := r.Context().Value(contextkeys.UserIDKey).(string)

	// Fetch users from the database
	user, err := models.GetUserByID(userId, db)
	if err != nil {
		log.Printf("Failed to retrieve current user: %v\n", err)
		http.Error(w, "Error getting current user", http.StatusInternalServerError)
		return
	}

	// Respond with user as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	vars := mux.Vars(r)
	userID := vars["userId"]

	// Fetch users from the database
	user, err := models.GetUserByID(userID, db)
	if err != nil {
		log.Printf("Failed to retrieve current user: %v\n", err)
		http.Error(w, "Error getting current user", http.StatusInternalServerError)
		return
	}

	// Respond with user as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

/*
POST /api/v1/users: Adds a new user to the db.

Request Body:

	{
		"id": <unique identifier for the user> STRING,
		"name": <user's name> STRING,
		"email": <UNIQUE email for the user> STRING,
		"bio": <short biography of the user> STRING
	}

Return:

	200 OK: Returns the newly created user object on success, with all fields populated.
	400 BAD REQUEST: Returns an error message if the request body is not correctly formatted (e.g., missing or invalid fields).
	500 INTERNAL ERROR: Returns an error message if the server fails to insert the new user into the database.
*/
func PostUserHandler(w http.ResponseWriter, r *http.Request) {
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	// Decode the user from the request body
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		log.Printf("Invalid request body provided: %v\n", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Decode profile picture from base64 (if provided)
	if user.ProfilePicture != "" {
		decodedPicture, err := base64.StdEncoding.DecodeString(user.ProfilePicture)
		if err != nil {
			log.Printf("Invalid profile picture encoding: %v\n", err)
			http.Error(w, "Invalid profile picture encoding", http.StatusBadRequest)
			return
		}
		user.ProfilePicture = string(decodedPicture)
	}

	// Call the PostUser function to insert the user into the database
	if err := models.PostUser(user, db); err != nil {
		log.Printf("Error creating new user: %v\n", err)
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	// Respond with the created user
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

/*
PATCH /api/v1/users: Updates the profile of the current user.

Request Body: (If a field is not provided, it will not be changed)

	{
		"name": <new name for the user> STRING,
		"email": <UNIQUE email for the user> STRING,
		"bio": <short bio for the user> STRING,
		"profile_picture": <empty for now> STRING
	}

Return:

	200 OK: Returns the updated user object on success.
	400 BAD REQUEST: Returns an error message if the request body is not formatted correctly (e.g., missing or invalid fields).
	500 INTERNAL ERROR: Returns an error message if the server fails to update the user in the database.
*/
func PatchUserHandler(w http.ResponseWriter, r *http.Request) {
	// Extract db and userID from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	// decode the user from the request body
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		log.Printf("Invalid request body provided: %v\n", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	// userID must be the current user
	user.ID = userID

	// Call patchUser to update the user in the database
	if err := models.PatchUser(user, db); err != nil {
		log.Printf("Error updating user: %v\n", err)
		http.Error(w, "Error updating user", http.StatusInternalServerError)
		return
	}

	// Respond with the updated user
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

/*
DELETE /api/v1/users: delete any user

Request Body:

	{
		"id": <unique_id> STRING
	}

Return:

	200 OK: return success message on deletion
	400 BAD REQUEST: json formatted wrong
	500 INTERNAL ERROR: unable to insert
*/
func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	// Extract db from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	// extract user id from request
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		log.Printf("Invalid request body provided: %v\n", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Call the DeleteUser function to delete the user from the database
	if err := models.DeleteUser(user.ID, db); err != nil {
		log.Printf("Error deleting user: %v\n", err)
		http.Error(w, "Error deleting user", http.StatusInternalServerError)
		return
	}

	// Respond with a success message
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User deleted successfully"))
}
