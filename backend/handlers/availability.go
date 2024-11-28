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
		{
			"id": <unique ID for each timeslot> INT
			"user_id": <corresponding user> STRING
			"start_time": <HH:MM> STRING
			"end_time": <HH:MM> STRING
			"day_of_week": <Monday - Sunday> STRING
		}
	500 Internal Error: not able to get availability
*/
func GetAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--GetAvailabilityHandler--") // logging all queries
	// db and userID from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	// query availability
	availability, err := models.GetAvailability(userID, db)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(availability)
}

/*
POST /api/v1/availability: Adds a new time slot to `availability` for the current user.

Request Body: A JSON object representing the new availability (Overlapping availabilities will NOT be inserted)
	{
		"start_time": <Start time of the time slot in ISO 8601 format, e.g., "2024-11-28T10:00:00Z">,
		"end_time": <End time of the time slot in ISO 8601 format, e.g., "2024-11-28T11:00:00Z">,
		"day_of_week": <Day of the week, e.g., "Monday">
	}

Return:
	200 OK: Returns a success message
	409 CONFLICT: Returns a JSON response indicating a time slot conflict with an existing entry:
	{
		"error": "overlap_detected",
		"message": "Time slot overlaps with an existing entry",
		"conflict": {
			"id": <ID of the conflicting availability entry>,
			"user_id": <User ID of the conflicting entry>,
			"start_time": <Start time of the conflicting entry>,
			"end_time": <End time of the conflicting entry>,
			"day_of_week": <Day of the week for the conflicting entry>
		}
	}
*/

func PostAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("--PostAvailabilityHandler--") // logging all queries
	// extract ID, database, and request body
	var availability models.Availability
	if err := json.NewDecoder(r.Body).Decode(&availability); err != nil {
		http.Error(w, "Invalid request payload, must be well formatted JSON", http.StatusBadRequest)
		return
	}
	availability.UserID = r.Context().Value(contextkeys.UserIDKey).(string)
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
PUT /api/v1/availability: Updates an existing time slot in `availability` for the current user.

Request Body: A JSON object representing the updated availability entry

	{
		"id": <ID of the time slot to update, must be unique and exist in the database>,
		"start_time": <New start time of the time slot in ISO 8601 format, e.g., "2024-11-28T10:00:00Z">,
		"end_time": <New end time of the time slot in ISO 8601 format, e.g., "2024-11-28T11:00:00Z">,
		"day_of_week": <New day of the week, e.g., "Monday">
	}

Return:

	200 OK: Returns a success message indicating that the time slot was successfully updated.
	400 BAD REQUEST: Returns an error message indicating that the request is invalid or the update could not be processed.
*/
func PutAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	var availability models.Availability
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
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
	availability.UserID = r.Context().Value(contextkeys.UserIDKey).(string)

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
DELETE /api/v1/availability: Deletes a time slot from `availability` by ID, if it belongs to the current user.

Request Body: A JSON object containing the ID of the time slot to delete:

	{
		"id": <ID of the time slot to delete, must be unique and associated with the current user>
	}

Return:

	200 OK: Returns a success message confirming that the time slot was deleted.
	400 BAD REQUEST: Returns an error message if the provided ID is in an invalid format or missing.
	500 INTERNAL ERROR: Returns an error message if the deletion operation fails due to server or database issues.
*/
func DeleteAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	type payload struct {
		ID     int    `json:"id"` // Availability ID to delete
		UserID string `json:"user_id"`
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
	req.UserID = r.Context().Value(contextkeys.UserIDKey).(string)

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
