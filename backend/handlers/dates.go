package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

/*
GET /api/v1/dates/status?: Retrieves the dates for the current user. Optionally only get dates with a certain status by specifying the request url.

Request Params:

	"status" = "pending", "confirmed", "rejected"

Example:

	GET `/api/v1/dates/pending` would return only pending dates.

Returns:

	200 OK: Returns a list of matches with their respective dates.
	    {
	        "match_id": <match_id> INT,
	        "dates": [
	            {
	                "id": <int>,
	                "user1_id": <current user id > STRING,
					"user2_id": <other user id > STRING,
	                "date_start": "<date_start> ISO 8601 format",
	                "date_end": "<date_end> ISO 8601 format",
	                "status": <boolean>
	            },
	            ...
	        ]
	    }
	500 INTERNAL SERVER ERROR: Returns an error message if an internal error occurs.
	400 BAD REQUEST: Returns an error message if the request is invalid (e.g., invalid matchId format).
*/
func GetDatesHandler(w http.ResponseWriter, r *http.Request) {
	// userId and db from context
	userID := r.Context().Value(contextkeys.UserIDKey).(string)
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	// Specific matchID from request params
	vars := mux.Vars(r)
	status := vars["status"]

	dates, err := models.GetDates(userID, status, db)
	if err != nil {
		log.Printf("Error getting dates: %v\n", err)
		http.Error(w, "Failed to get dates", http.StatusInternalServerError)
		return
	}

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dates)
}

/*
POST /api/v1/dates: Inserts a new date associated with a particular matchId.

Request Body:

	{
		"user2_id": <the other user ID> string
	    "date_start": "<when the date will start> ISO 8601 format",
	    "date_end": "<when the date will end> ISO 8601 format",
	}

Responses:

	    200 OK: Returns the inserted date object upon successful creation.
			{
				"id": <unique id> INT
				"user1_id": <current user id > STRING,
				"user2_id": <other user id > STRING,
				"date_start": "<date_start> ISO 8601 format",
				"date_end": "<date_end> ISO 8601 format",
				"status": <"pending", "confirmed", "rejected">
			}
	    400 BAD REQUEST: Returns an error message if the request body is malformed or required fields are missing.
*/
func PostDateHandler(w http.ResponseWriter, r *http.Request) {
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	// Parse JSON from the request body
	var date models.Date
	if err := json.NewDecoder(r.Body).Decode(&date); err != nil {
		log.Printf("Invalid request body: %v\n", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate input
	err := ValidateIsoTimestamp(date)
	if err != nil || date.User2ID == "" {
		log.Printf("Request is missing required fields, %v\n", err)
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	date.User1ID = userID
	date.Status = "pending" // New dates start as pending

	// insert the scheduled date
	id, err := models.PostDate(date, db)
	if err != nil {
		log.Printf("Failed to insert a date: %v\n", err)
		http.Error(w, "Failed to insert date", http.StatusInternalServerError)
		return
	}
	date.ID = int(id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(date)
}

/*
PATCH /api/v1/dates: Update a date's status.

Request Body:

	{
		"id" = valid date ID
		"status" = "pending", "confirmed", "rejected"
	}

Example:

	PATCH `/api/v1/dates/1/confirmed` would confirm date with ID 1

Returns:

	200 OK: Return the updated date
		{
			"id": <unique id> INT
			"user1_id": <current user id > STRING,
			"user2_id": <other user id > STRING,
			"date_start": "<date_start> ISO 8601 format",
			"date_end": "<date_end> ISO 8601 format",
			"status": <"pending", "confirmed", "rejected">
		}
	500 INTERNAL SERVER ERROR: Returns an error message if an internal error occurs.
	400 BAD REQUEST: Returns an error message if the request is invalid (e.g., invalid matchId format).
*/
func PatchDateHandler(w http.ResponseWriter, r *http.Request) {
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	// Parse JSON from the request body
	var date models.Date
	if err := json.NewDecoder(r.Body).Decode(&date); err != nil {
		log.Printf("Invalid request body: %v\n", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if date.ID <= 0 {
		log.Printf("Invalid id provided: %d\n", date.ID)
		http.Error(w, "Invalid id provided", http.StatusBadRequest)
		return
	}
	if !models.IsValidStatus(date.Status) {
		log.Printf("Invalid status provided: %s\n", date.Status)
		http.Error(w, "Invalid status provided", http.StatusBadRequest)
		return
	}

	err := models.PatchDate(date.ID, date.Status, db)
	if err != nil {
		log.Printf("Error updating date status: %v\n", err)
		http.Error(w, "Updating status failed", http.StatusInternalServerError)
		return
	}

	updatedDate, err := models.GetDate(date.ID, db)
	if err != nil {
		log.Printf("Failed to retrieve updated date: %v\n", err)
		http.Error(w, "Retrieving updated date failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedDate)
}

/*
DELETE /api/v1/dates/{dateId}: Deletes a date based on the request parameter dateId.

Request URL Parameter:

	"dateId": <ID of the date to be deleted> INT

Returns:

	204 No Content: Indicates the date was successfully deleted.
	400 Bad Request: Returned if the date ID is not valid or cannot be converted to an integer.
	500 Internal Server Error: Returned if there is an error deleting the date or querying the database.
*/
func DeleteDateHandler(w http.ResponseWriter, r *http.Request) {
	db := r.Context().Value("db").(*sql.DB)

	// get the date ID from the route parameters
	vars := mux.Vars(r)
	dateIDStr := vars["dateId"]

	// convert into int
	dateID, err := strconv.Atoi(dateIDStr)
	if err != nil {
		log.Printf("Invalid date ID: %d\n", dateID)
		http.Error(w, "Invalid date ID", http.StatusBadRequest)
		return
	}

	// Call the function to delete the date.
	err = models.DeleteDate(dateID, db)
	if err != nil {
		log.Printf("Failed to delete date: %v\n", err)
		http.Error(w, "Error deleting date", http.StatusInternalServerError)
		return
	}

	// Send a response indicating success.
	w.WriteHeader(http.StatusNoContent)
}

// HELPER FUNC: Make sure date_start and date_end are valid ISO 8601 format
func ValidateIsoTimestamp(date models.Date) error {
	// Parse times to ensure start_time < end_time
	start, err := time.Parse(time.RFC3339, date.DateStart)
	if err != nil {
		return errors.New("invalid date_start format. Must be valid ISO 8601 format (YYYY-MM-DDTHH:MM:SS)")
	}

	end, err := time.Parse(time.RFC3339, date.DateEnd)
	if err != nil {
		return errors.New("invalid date_end format.  Must be valid ISO 8601 format (YYYY-MM-DDTHH:MM:SS)")
	}

	if !start.Before(end) {
		return errors.New("date_start must be earlier than date_end")
	}

	return nil
}
