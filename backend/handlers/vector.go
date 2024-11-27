package handlers

import "net/http"

func GetVectorHandler(w http.ResponseWriter, r *http.Request) {
	// Return similarity vector for the current user
	// just call GetUserByID
}

/*
PUT /api/v1/vector: Inserts or updates the similarity vector for the current user. (NOT IMPLEMENTED YET)

Request Body:

	{
	    "similarity_vector": <idk yet>
	}

Returns:

	200 OK:
	idk:
*/
func PutVectorHandler(w http.ResponseWriter, r *http.Request) {
	// create new similarity vector for the current user, or update the vector if it exists
}

func DeleteVectorHandler(w http.ResponseWriter, r *http.Request) {
	// set the vector to current user to NULL
}
