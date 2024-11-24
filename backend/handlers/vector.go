package handlers

import "net/http"

func GetVectorHandler(w http.ResponseWriter, r *http.Request) {
	// Return similarity vector for the current user
	// just call GetUserByID
}

func PutVectorHandler(w http.ResponseWriter, r *http.Request) {
	// create new similarity vector for the current user, or update the vector if it exists
}

func DeleteVectorHandler(w http.ResponseWriter, r *http.Request) {
	// set the vector to current user to NULL
}
