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

	"github.com/gorilla/mux"
)

/*
GET /api/v1/dates/{matchId}:

	Retrieves the dates corresponding to a specific matchId.
	If the matchId is not provided, returns all matchIds and their corresponding dates for the current user.

Responses:

	    200 OK: Returns a list of matches with their respective dates.
			{
				"match_id": <match_id> INT,
				"dates": [
					{
						"id": <int>,
						"match_id": <int>,
						"date_start": "<date_start> ISO 8601 format",
						"date_end": "<date_end> ISO 8601 format",
						"is_confirmed": <boolean>
					},
					...
				]
			}

	    500 INTERNAL SERVER ERROR:
	        Returns an error message if an internal error occurs.

	    400 BAD REQUEST:
	        Returns an error message if the request is invalid (e.g., invalid matchId format).
*/
func GetDatesHandler(w http.ResponseWriter, r *http.Request) {
	// userId and db from context
	userID := r.Context().Value(contextkeys.UserIDKey).(string)
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	// Specific matchID from request params
	vars := mux.Vars(r)
	matchIDStr := vars["matchId"]

	type Match struct {
		MatchID int           `json:"match_id"`
		Dates   []models.Date `json:"dates"`
	}
	var matches []Match

	// Get dates for a particular match, or for all matches
	if matchIDStr != "" {
		// Parse matchID as an integer
		matchID, err := strconv.Atoi(matchIDStr)
		if err != nil {
			http.Error(w, "Invalid match ID format", http.StatusBadRequest)
			return
		}

		// Fetch dates for the specific matchID
		dates, err := models.GetDatesForMatch(matchID, db)
		if err != nil {
			http.Error(w, "Failed to get dates for requested matchID", http.StatusInternalServerError)
			return
		}

		matches = append(matches, Match{
			MatchID: matchID,
			Dates:   dates,
		})

	} else {
		// Fetch all matchIDs for the user
		matchIDs, err := models.GetMatches(userID, db)
		if err != nil {
			fmt.Printf("Failed retrieving matches: %v\n", err)
			http.Error(w, "Failed to retrieve matches for the current user", http.StatusInternalServerError)
			return
		}

		// Fetch dates for each matchID
		for _, matchID := range matchIDs {
			dates, err := models.GetDatesForMatch(matchID.ID, db)
			if err != nil {
				fmt.Printf("error getting dates: %v\n", err)
				http.Error(w, "Failed to get dates for a match", http.StatusInternalServerError)
				return
			}

			matches = append(matches, Match{
				MatchID: matchID.ID,
				Dates:   dates,
			})
		}
	}

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}

/*
POST /api/v1/dates:
    Inserts a new date associated with a particular matchId.

Request Body:
    {
        "match_id": <id of the match this date will correspond to> INT,
        "date_start": "<when the date will start> ISO 8601 format",
        "date_end": "<when the date will end> ISO 8601 format",
        "is_confirmed": <whether the date is confirmed; defaults to FALSE if not provided> BOOL
    }

Responses:
    200 OK: Returns the inserted date object upon successful creation.
		{
			"match_id": <match_id> INT,
			"date_start": "<date_start> ISO 8601 format",
			"date_end": "<date_end> ISO 8601 format",
			"is_confirmed": <boolean>
		}

    400 BAD REQUEST:
		Returns an error message if the request body is malformed or required fields are missing.
*/

func PostDateHandler(w http.ResponseWriter, r *http.Request) {
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)

	// Parse JSON from the request body
	var date models.Date
	if err := json.NewDecoder(r.Body).Decode(&date); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate input ADD MORE LATER
	if date.MatchID == 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	log.Println(date.DateStart, date.DateEnd)

	// insert the scheduled date
	id, err := models.PostDate(date, db)
	if err != nil {
		http.Error(w, "Failed to insert scheduled date", http.StatusInternalServerError)
		return
	}
	date.ID = int(id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(date)
}

/*
DELETE /api/v1/dates/{dateId}:

	Deletes a date based on the request parameter dateId.

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
		http.Error(w, "Invalid date ID", http.StatusBadRequest)
		return
	}

	// Call the function to delete the date.
	err = models.DeleteDate(dateID, db)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error deleting date: %v", err), http.StatusInternalServerError)
		return
	}

	// Send a response indicating success.
	w.WriteHeader(http.StatusNoContent)
}
