package handlers

import "net/http"

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

	// If offset + count < 50 matches, our matches table will contain the matches
	// call models.GetMatches to get matches from our table

	// If offset + count > 50, or if querying GetMatches didn't return enough matches, call models.ComputeMatches
	// return appropriate matches

}
