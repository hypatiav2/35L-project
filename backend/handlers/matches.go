package handlers

import {
	"database/sql"
	"encoding/json"
	"fmt"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"net/http"
}

/*
GET /api/v1/matches: find top matches for a user.

Request Body:

	"count": <the number of matches to return> INT
	"offset": <The starting point for the results> INT

Returns:

		[]match
			"user1_id": <current user> STRING
			"user2_id": <matched user> STRING
			"similarity_score": <similarity between user 1 and 2> INTEGER,
	    	"match_status": <if the match has been accepted> TEXT ('pending', 'accepted', 'rejected')
*/
func GetMatchesHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("--GetMatchesHandler--") // logging all queries
	// db and userID from context
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	userID := r.Context().Value(contextkeys.UserIDKey).(string)

	type Data struct {
		Count int `json:"count"`
		Offset int `json:"offset"`
	}

	var data Data
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid request payload, must be well formatted JSON", http.StatusBadRequest)
		return
	}

	var matches []Match
	var err Error

	// If offset + count < 50 matches, our matches table will contain the matches
	// call models.GetMatches to get matches from our table

	if data.offset + data.count <= 50 {
		matches, err = models.GetMatches(userID, db)
		if err != nil {
			http.Error(w, "Error getting matches", http.StatusInternalServerError)
			return
		}
	}

	// If offset + count > 50, or if querying GetMatches didn't return enough matches, call models.ComputeMatches
	// return appropriate matches

	else {
		matches, err = models.ComputeMatches(userID, db)
		if err != nil {
			http.Error(w, "Error computing matches", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}
