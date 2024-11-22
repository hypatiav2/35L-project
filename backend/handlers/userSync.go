package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"go-react-backend/contextkeys"
	"go-react-backend/models"
	"net/http"
)

// Assume that a webhook request will come with a payload of this form; record represents the user to insert/update/delete
type WebhookPayload struct {
	Event  string      `json:"event"`  // INSERT, UPDATE, DELETE
	Record models.User `json:"record"` // The data for the event
}

/*
Insert, update, or delete user from users table.

Request Body:

	WebhookPayload:
		"event": <insert/update/or delete>
		"record": <JSON representation of models.Users struct>

Return:

	200 OK on success
	500 INTERNAL ERROR on failure
*/
func UserSyncWebhookHandler(w http.ResponseWriter, r *http.Request) {
	// Extract webhook payload from request body
	var payload WebhookPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}
	db := r.Context().Value(contextkeys.DbContextKey).(*sql.DB)
	user := payload.Record

	// Handle the event type
	switch payload.Event {
	case "INSERT":
		err := models.PostUser(user, db)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to insert user: %s", err), http.StatusInternalServerError)
			return
		}
	case "UPDATE":
		err := models.PutUser(user, db)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to update user: %s", err), http.StatusInternalServerError)
			return
		}
	case "DELETE":
		err := models.DeleteUser(user.ID, db)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to delete user: %s", err), http.StatusInternalServerError)
			return
		}
	default:
		http.Error(w, "Unsupported event type", http.StatusBadRequest)
		return
	}

	// Respond with success
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Webhook processed successfully")
}
