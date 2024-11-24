package handlers

import "net/http"

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

	// If offset + count < 50 matches, our matches table will contain the matches
	// call models.GetMatches to get matches from our table

	// If offset + count > 50, or if querying GetMatches didn't return enough matches, call models.ComputeMatches
	// return appropriate matches

}
