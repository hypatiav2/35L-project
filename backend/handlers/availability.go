package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"go-react-backend/contextkeys" // access request context
	"go-react-backend/models"      // interact with db
	"log"
	"net/http"
	"time"

	_ "modernc.org/sqlite"
)

/*
GET/api/v1/availability: get all timeslots for the current user.

Return:

	200 OK: list of availabilities returned in JSON format
		"id": <unique ID for each timeslot> INT
		"user_id": <corresponding user> STRING
		"start_time": <HH:MM> STRING
		"end_time": <HH:MM> STRING
		"day_of_week": <Monday - Sunday> STRING
	500 Internal Error: not able to get availability
*/
func GetAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--GetAvailabilityHandler--") // logging all queries

	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := "1" // test user

	availability, err := models.GetAvailability(userID, db)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(availability)
}

/*
POST/api/v1/availability: adds one new timeslot to `availability` for the current user.

Request Body:

	JSON formatted availability, that corresponds to Availability Go struct

Return:

	200 OK: success message on insertion
	409 CONFLICT: Return JSON:
			"error":   "overlap_detected",
			"message": "Time slot overlaps with an existing entry",
			"conflict": Conflicting Availability Struct,
*/
func PostAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--PostAvailabilityHandler--") // logging all queries
	// extract ID, database, and request body
	var availability models.Availability
	if err := json.NewDecoder(r.Body).Decode(&availability); err != nil {
		http.Error(w, "Invalid request payload, must be well formatted JSON", http.StatusBadRequest)
		return
	}
	availability.UserID = "1" // TEMP. Later pull from request context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	err := ValidateTimeslot(availability)
	if err != nil {
		fmt.Print(err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// check for overlapping timeslots
	overlap, err := models.GetOverlapping(availability, db)
	if err != nil {
		http.Error(w, "Failed to check overlap", http.StatusInternalServerError)
		return
	}
	if overlap != nil {
		// Conflict detected, respond with conflict details
		w.WriteHeader(http.StatusConflict)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":    "overlap_detected",
			"message":  "Time slot overlaps with an existing entry",
			"conflict": overlap, // Include the conflicting time slot
		})
		return
	}

	// Post Availability
	err = models.PostAvailability(availability, db)
	if err != nil {
		http.Error(w, "Failed to set availability", http.StatusInternalServerError)
		return
	}

	// Respond with success
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Availability set successfully",
	})
}

/*
PUT/api/v1/availability: updates a timeslot in `availability` for the current user.

Request Body:

	"id": <unique timeslot to update> INT
	"user_id": <current user> STRING
	"start_time": <New HH:MM> STRING
	"end_time": <New HH:MM> STRING
	"day_of_week": <New Monday - Sunday> STRING

Return:

	200 OK: success message on update
	400 BAD REQUEST: replies with an error message
*/
func PutAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	var availability models.Availability
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := "1" // grab from context later

	// Parse the JSON request body
	if err := json.NewDecoder(r.Body).Decode(&availability); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate the timeslot data
	if err := ValidateTimeslot(availability); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Can only update current user
	if availability.UserID != userID {
		http.Error(w, "Cannot only update timeslot for the current user", http.StatusBadRequest)
	}

	// Update the availability in the database
	if err := models.PutAvailability(availability, db); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond with a success message
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Availability successfully updated",
	})
}

/*
DELETE/api/v1/availability: deletes a timeslot by ID from `availability`, if it belongs to the current user.

Request Body:

	"id": <unique timeslot to update> INT

Return:

	200 OK: success message on deletion
	400 BAD REQUEST: error if invalid format
	500 INTERNAL ERROR: error if unable to delete
*/
func DeleteAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	type payload struct {
		ID     int `json:"id"` // Availability ID to delete
		UserID int `json:"user_id"`
	}
	var req payload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}
	if req.ID == 0 {
		http.Error(w, "Request body must contain an 'id'", http.StatusBadRequest)
		return
	}
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	req.UserID = 1 // r.Context().Value(contextkeys.UserIDKey).(string)

	// Call the DeleteAvailability function to delete the entry
	err := models.DeleteAvailability(req.ID, req.UserID, db)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error deleting availability: %s", err), http.StatusInternalServerError)
		return
	}

	// Respond with a success message
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Availability successfully deleted",
	})
}

/* HELPER FUNCTIONS */

// ValidateTimeslot checks if the provided Availability struct has a valid structure.
func ValidateTimeslot(avail models.Availability) error {
	// Valid days of the week
	validDays := map[string]bool{
		"Monday":    true,
		"Tuesday":   true,
		"Wednesday": true,
		"Thursday":  true,
		"Friday":    true,
		"Saturday":  true,
		"Sunday":    true,
	}

	// Validate day of the week
	if !validDays[avail.DayOfWeek] {
		return errors.New("invalid day_of_week; must be Monday through Sunday")
	}
	// Parse times to ensure start_time < end_time
	start, err := time.Parse("15:04", avail.StartTime)
	if err != nil {
		return errors.New("invalid start_time format")
	}

	end, err := time.Parse("15:04", avail.EndTime)
	if err != nil {
		return errors.New("invalid end_time format")
	}

	if !start.Before(end) {
		return errors.New("start_time must be earlier than end_time")
	}

	return nil
}
