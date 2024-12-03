package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"net/http"
	"strconv"
)

/*
GET /api/v1/matches: find the top matches for a user.

Returns a list of Match objects: each match corresponds to a overlapping availability between the current user and another user.
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
		{

			"user1_id": <current user> STRING
			"user2_id": <matched user> STRING
			"similarity_score": <similarity between user 1 and 2> FLOAT,
	    	"match_status": <if the match has been accepted> TEXT or NULL ('pending', 'accepted', 'rejected', null)
		}
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
			http.Error(w, "Invalid count parameter", http.StatusBadRequest)
			return
		}
	}

	// Parse and validate the offset parameter
	if offsetParam != "" {
		var err error
		offset, err = strconv.Atoi(offsetParam)
		if err != nil || offset < 0 {
			http.Error(w, "Invalid offset parameter", http.StatusBadRequest)
			return
		}
	}

	var matches []models.Match
	var err error

	if offset+count <= 50 {
		// If offset + count < 50 matches: call models.GetMatches to get matches from our table
		matches, err = models.GetMatches(userID, db)
		if err != nil {
			http.Error(w, "Error getting matches", http.StatusInternalServerError)
			return
		}
	}
	if len(matches) < 50 {
		// update matches table if it looks too empty
		models.UpdateMatches(userID, db)
		if err != nil {
			http.Error(w, "Error updating matches", http.StatusInternalServerError)
			return
		}
	}
	if offset+count > 50 {
		// If offset + count > 50 or if querying GetMatches didn't return enough matches: compute matches manually
		matches, err = models.ComputeMatches(userID, db)
		if err != nil {
			http.Error(w, "Error computing matches", http.StatusInternalServerError)
			return
		}
	}

	// Get an appropriate subset of matches
	matchesSlice, err := PaginateMatches(matches, count, offset)
	if err != nil {
		http.Error(w, "Error getting a subset of matches: invalid offset.", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matchesSlice)
}

// HELPER FUNC: returns a subset of matches based on the count and offset.
func PaginateMatches(matches []models.Match, count, offset int) ([]models.Match, error) {
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
