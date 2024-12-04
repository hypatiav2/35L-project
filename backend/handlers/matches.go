package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"log"
	"net/http"
	"strconv"
)

/*
GET /api/v1/matches: find the top matches for a user.

Returns a list of Matches: each match corresponds to another user.
Each match has a sublist of availability timeslots, where both the current user and that user are available.
The list is sorted by the similarity score between [current user] and [other user].

Request Params:

	count: number of matches to return
	offset: offset from beginning of matches list to return from

> Example:
> count = 20 and offset = 10,
> `GET /api/v1/matches?count=20&offset=10` returns the 10th to 30th overlapping availability to the current user, sorted by similarity.

Returns:

	200 OK: Returns a list of matches
	[
		{ // FIRST MATCH ENTRY
			"user1_id": "afd37871-3445-4162-9de0-8e3bfd144b98",
			"user2_id": "9e2d0dec-fec2-4cab-b742-bad2ea343490",
			"similarity_score": 1,
			"availabilities": [
				{ // LIST OF AVAILABILITIES
					"id": 0,
					"user_id": "9e2d0dec-fec2-4cab-b742-bad2ea343490",
					"start_time": "11:30",
					"end_time": "12:00",
					"day_of_week": "Monday"
				},
				...
			]
		},
		... // MORE MATCH ENTRIES
	]
*/
func GetMatchesHandler(w http.ResponseWriter, r *http.Request) {
	// get db and userID from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	// request params
	countParam := r.URL.Query().Get("count")   // 'count' parameter
	offsetParam := r.URL.Query().Get("offset") // 'offset' parameter

	// Default values
	count := 10
	offset := 0

	// Parse and validate the count parameter
	if countParam != "" {
		var err error
		count, err = strconv.Atoi(countParam)
		if err != nil || count <= 0 {
			log.Printf("Invalid count provided (%d): %v\n", count, err)
			http.Error(w, "Invalid count parameter", http.StatusBadRequest)
			return
		}
	}

	// Parse and validate the offset parameter
	if offsetParam != "" {
		var err error
		offset, err = strconv.Atoi(offsetParam)
		if err != nil || offset < 0 {
			log.Printf("Invalid offset provided (%d): %v\n", offset, err)
			http.Error(w, "Invalid offset parameter", http.StatusBadRequest)
			return
		}
	}

	var matches []models.UserMatches
	var err error

	if offset+count <= 50 {
		// If offset + count < 50 matches: call models.GetMatches to get matches from our table
		matches, err = models.GetMatches(userID, db)
		if err != nil {
			log.Printf("Error retrieving matches: %v\n", err)
			http.Error(w, "Error getting matches", http.StatusInternalServerError)
			return
		}
	}
	if len(matches) < 50 {
		// update matches table if it looks too empty
		err = models.UpdateMatches(userID, db)
		if err != nil {
			log.Printf("Error updating matches: %v\n", err)
			http.Error(w, "Error updating matches", http.StatusInternalServerError)
			return
		}
	}
	if offset+count > 50 || len(matches) < 50 {
		// If offset + count > 50 or if querying GetMatches didn't return enough matches: compute matches manually
		matches, err = models.ComputeMatches(userID, db)
		if err != nil {
			log.Printf("Error computing new matches: %v\n", err)
			http.Error(w, "Error computing matches", http.StatusInternalServerError)
			return
		}
	}

	// Get an appropriate subset of matches
	matchesSlice, err := PaginateMatches(matches, count, offset)
	if err != nil {
		log.Printf("Error getting a subset of matches to return: %v\n", err)
		http.Error(w, "Error getting a subset of matches: invalid offset.", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matchesSlice)
}

// HELPER FUNC: returns a subset of matches based on the count and offset.
func PaginateMatches(matches []models.UserMatches, count, offset int) ([]models.UserMatches, error) {
	// Validate offset
	if offset < 0 || offset > len(matches) {
		return nil, fmt.Errorf("invalid offset: %d", offset)
	}

	// Calculate the end index for the slice
	end := offset + count
	if end > len(matches) {
		end = len(matches) // Ensure we don't exceed the slice bounds
	}

	// Return the subset of matches
	return matches[offset:end], nil
}
