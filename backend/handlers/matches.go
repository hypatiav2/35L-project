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
GET /api/v1/matches: find the top matches for a user.

- Finds other users who have overlapping availability with the current user
- returns as a list "matches", with the other user's id and a similarity score between the two users

Request Body:

	{
		"count": <the number of matches to return, default 10> INT
		"offset": <The starting point for the results, default 0> INT
	}

- Example: with count = 20 and offset = 10, this GET will return the 10th to 30th most similar users to the current user, who have overlapping availability.

Returns:

	200 OK: Returns a list of matches
		{
			"user1_id": <current user> STRING
			"user2_id": <matched user> STRING
			"similarity_score": <similarity between user 1 and 2> FLOAT,
	    	"match_status": <if the match has been accepted> TEXT or NULL ('pending', 'accepted', 'rejected', null)
		}
*/
func GetMatchesHandler(w http.ResponseWriter, r *http.Request) {

	// SET default offset to 0, count to 10.

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
