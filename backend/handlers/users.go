package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"log"
	"net/http"

	_ "modernc.org/sqlite" // SQLite driver
)

/*
GET/api/v1/users: adds a new user.

Return:

	200 OK: []User
		"id": <unique_id> STRING
		"name": <name> STRING
		"email": <unique_email> STRING
		"bio": <bio> STRING
		"vector": <vector> STRING
		"profile_picture": <empty for now> STRING
	500 INTERNAL ERROR: unable to retrieve users
*/
func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--GetAllUsersHandler--") // Log query error
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	// Fetch users from the database
	users, err := models.GetAllUsers(db)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond with user as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func GetCurrentUserHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--GetCurrentUserHandler--") // Log query error
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userId := r.Context().Value(contextkeys.UserIDKey).(string)

	// Fetch users from the database
	user, err := models.GetUserByID(userId, db)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond with user as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

/*
POST/api/v1/users: adds a new user.

Request Body:

	"id": <unique_id> STRING
	"name": <name> STRING
	"email": <unique_email> STRING
	"bio": <bio> STRING

Return:

	200 OK: return inserted user on success
	400 BAD REQUEST: json formatted wrong
	500 INTERNAL ERROR: unable to insert
*/
func PostUserHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--PostUserHandler--") // Log all requests
	// Extract db from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	// decode the user from the request body
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Call the PostUser function to insert the user into the database
	if err := models.PostUser(user, db); err != nil {
		http.Error(w, fmt.Sprintf("Error creating user: %v", err), http.StatusInternalServerError)
		return
	}

	// Respond with the created user
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

/*
PATCH/api/v1/users: updates the CURRENT user

Request Body:

	"name": <new_name> STRING
	"email": <unique_email> STRING
	"bio": <bio> STRING
	"profile_picture": <empty for now> STRING

Return:

	200 OK: return updated user on success
	400 BAD REQUEST: json formatted wrong
	500 INTERNAL ERROR: unable to insert
*/
func PatchUserHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--PatchUserHandler--") // Log all requests
	// Extract db and userID from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	// decode the user from the request body
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	// Set the user ID from the URL (to ensure we're updating the correct user)
	user.ID = userID

	// Call the PutUser function to update the user in the database
	if err := models.PatchUser(user, db); err != nil {
		http.Error(w, fmt.Sprintf("Error updating user: %v", err), http.StatusInternalServerError)
		return
	}

	// Respond with the updated user
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

/*
DELETE/api/v1/users: delete any user

Request Body:

	"id": <unique_id> STRING

Return:

	200 OK: return success message on deletion
	400 BAD REQUEST: json formatted wrong
	500 INTERNAL ERROR: unable to insert
*/
func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--DeleteUserHandler--") // Log all requests
	// Extract db from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	// extract user id from request
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Call the DeleteUser function to delete the user from the database
	if err := models.DeleteUser(user.ID, db); err != nil {
		http.Error(w, fmt.Sprintf("Error deleting user: %v", err), http.StatusInternalServerError)
		return
	}

	// Respond with a success message
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User deleted successfully"))
}
