package middleware

import (
	"context"
	"database/sql"
	"net/http"

	"go-react-backend/contextkeys"
)

// Attach db to a request's context
func DbMiddleware(db *sql.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Attach the db instance to the request context
			ctx := context.WithValue(r.Context(), contextkeys.DbContextKey, db)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
