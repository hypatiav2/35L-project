package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"go-react-backend/contextkeys"
	"go-react-backend/middleware"
	"go-react-backend/repositories"

	"github.com/jackc/pgtype"
)

/*
GetAvailability gets all availability entries for a given user

Context:

	userID: specific user the timeslot is assigned to
	connPool: connection to db

Returns:

		Error if the availability not found, or
		JSON on success:
			"user_id": "<UNIQUE_UUID>",
	    	"time_slots": null OR
*/
func GetAvailability(w http.ResponseWriter, r *http.Request) {
	// extract userID from context as a string
	userID, ok := r.Context().Value(contextkeys.UserIDKey).(string)
	if !ok {
		http.Error(w, "User ID is not a valid string", http.StatusUnauthorized)
		return
	}
	// extract connPool from context
	connPool := middleware.GetConnPool(r)

	//grab our availability from the database
	schedule, err := repositories.GetAvailabilityForUserID(userID, connPool)
	if err != nil {
		log.Println(err)
		http.Error(w, "Schedule not found", http.StatusNotFound)
		return
	}

	// return the schedule
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(schedule)
}

/*
InsertAvailability inserts a new availability time slot for a user.

Context:

	userID: specific user the timeslot is assigned to
	connPool: connection to db

Body (JSON):

	"start": "YYYY-MM-DDTHH:MM:SSZ"
	"end": "YYY-MM-DDTHH:MM:SSZ"

Returns:

	Error if the insertion fails, or
	Success after insertion.
*/
func InsertAvailability(w http.ResponseWriter, r *http.Request) {
	// store request body: in form "YYYY-MM-DDTHH:MM:SSZ"
	type RequestBody struct {
		Start string `json:"start"`
		End   string `json:"end"`
	}

	// extract userID and connPool from context
	userID, ok := r.Context().Value(contextkeys.UserIDKey).(string)
	if !ok {
		http.Error(w, "User ID is not a valid string", http.StatusUnauthorized)
		return
	}
	connPool := middleware.GetConnPool(r)

	// parse request
	var req RequestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	startTime, err := time.Parse(time.RFC3339, req.Start)
	if err != nil {
		http.Error(w, "Invalid start time format", http.StatusBadRequest)
		return
	}
	endTime, err := time.Parse(time.RFC3339, req.End)
	if err != nil {
		http.Error(w, "Invalid end time format", http.StatusBadRequest)
		return
	}

	// Create a tstzrange value from parsed request
	timeSlot := pgtype.Tstzrange{
		Lower: pgtype.Timestamptz{
			Time:   startTime,
			Status: pgtype.Present,
		},
		Upper: pgtype.Timestamptz{
			Time:   endTime,
			Status: pgtype.Present,
		},
		LowerType: pgtype.Inclusive,
		UpperType: pgtype.Inclusive,
		Status:    pgtype.Present,
	}

	// insert into availability table
	if err := repositories.InsertAvailability(userID, timeSlot, connPool); err != nil {
		log.Println(err)
		http.Error(w, "Failed to insert timeslot", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Timeslot added successfully"))
}
