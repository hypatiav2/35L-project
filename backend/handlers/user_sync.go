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
POST PUT DELETE /api/v1/webhooks/users: Insert, update, or delete a user from the users table.

Request Body:

	WebhookPayload:
		"event": <insert/update/or delete>
		"record": <JSON representation of models.Users struct>

Return:

	200 OK on success
	500 INTERNAL ERROR on failure
*/
/*
POST/PUT/DELETE /api/v1/webhooks/users: Syncs user data in the system based on webhook events.

Request Body: JSON formatted WebhookPayload with the following structure
	{
		"event": <event type: "INSERT", "UPDATE", or "DELETE">
		"record": <JSON representation of the user data>
	}

EXAMPLE:
	{
		"event": "INSERT",
		"record": {
			"id": "123423rgoisdnczxfmd",
			"name": "Timothy",
			"email": "bruin@ucla.edu",
			"bio": "loves to climb",
			"vector": null,
			"profile_picture": "https://example.com/images/johndoe.jpg"
		}
	}

Return:

	200 OK: Webhook processed successfully (user inserted, updated, or deleted)
	500 INTERNAL ERROR: If an error occurs while processing the request or interacting with the database
	400 BAD REQUEST: If the event type is unsupported or if the payload is malformed
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
		err := models.PatchUser(user, db)
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
