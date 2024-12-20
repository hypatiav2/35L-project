package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
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
			"start_time": <HH:MM:SS> STRING
			"end_time": <HH:MM:SS> STRING
			"day_of_week": <Monday - Sunday> STRING
		}
	500 Internal Error: not able to get availability
*/
func GetAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	// query availability
	availability, err := models.GetAvailability(userID, db)
	if err != nil {
		log.Printf("Error querying for user's availability: %v\n", err)
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
		"start_time": <New start time of the time slot in HH:MM:SS format, e.g., "10:00:00">,
		"end_time": <New end time of the time slot in HH:MM:SS format, e.g., "11:00:00">,
		"day_of_week": <New day of the week, e.g., "Monday">
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
	// extract userID, db, and request body
	var availability models.Availability
	if err := json.NewDecoder(r.Body).Decode(&availability); err != nil {
		log.Printf("Provided availability was not formatted correctly: %v\n", err)
		http.Error(w, "Invalid request payload, must be well formatted JSON", http.StatusBadRequest)
		return
	}

	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)
	availability.UserID = userID

	if len(availability.StartTime) == 5 { // "HH:MM" length
		availability.StartTime += ":00"
	}
	if len(availability.EndTime) == 5 { // "HH:MM" length
		availability.EndTime += ":00"
	}

	err := ValidateTimeslot(availability)
	if err != nil {
		log.Printf("Provided timeslot is invalid: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// check for overlapping timeslots
	overlap, err := models.GetOverlapping(availability, db)
	if err != nil {
		log.Printf("Error checking for overlapping availabilities: %v\n", err)
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
		log.Printf("Error posting availability: %v\n", err)
		http.Error(w, "Failed to set availability", http.StatusInternalServerError)
		return
	}

	// update matches with new availability
	err = models.UpdateMatches(userID, db)
	if err != nil {
		log.Printf("Error updating user's matches: %v\n", err)
		http.Error(w, "Error updating matches", http.StatusInternalServerError)
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
		log.Printf("Provided availability is poorly formatted: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(availability.StartTime) == 5 { // "HH:MM" length
		availability.StartTime += ":00"
	}
	if len(availability.EndTime) == 5 { // "HH:MM" length
		availability.EndTime += ":00"
	}

	// Validate the timeslot data
	if err := ValidateTimeslot(availability); err != nil {
		log.Printf("Provided availability is not valid: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Can only update current user
	userID := r.Context().Value(contextkeys.UserIDKey).(string)
	availability.UserID = userID

	// Update the availability in the database
	if err := models.PutAvailability(availability, db); err != nil {
		log.Printf("Error writing response: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update match based on availability
	err := models.UpdateMatches(userID, db)
	if err != nil {
		log.Printf("Failed to update matches: %v\n", err)
		http.Error(w, "Error updating matches", http.StatusInternalServerError)
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
		log.Printf("Invalid request body body provided: %v\n", err)
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}
	if req.ID == 0 {
		log.Print("Request body must contain an Availability ID")
		http.Error(w, "Request body must contain an 'id'", http.StatusBadRequest)
		return
	}
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	req.UserID = r.Context().Value(contextkeys.UserIDKey).(string)

	// Call the DeleteAvailability function to delete the entry
	err := models.DeleteAvailability(req.ID, req.UserID, db)
	if err != nil {

		http.Error(w, "Error deleting availability", http.StatusInternalServerError)
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
	start, err := time.Parse("15:04:05", avail.StartTime)
	if err != nil {
		return errors.New("invalid start_time format. Must be HH:MM:SS")
	}

	end, err := time.Parse("15:04:05", avail.EndTime)
	if err != nil {
		return errors.New("invalid end_time format. Must be HH:MM:SS")
	}

	if !start.Before(end) {
		return errors.New("start_time must be earlier than end_time")
	}

	return nil
}
