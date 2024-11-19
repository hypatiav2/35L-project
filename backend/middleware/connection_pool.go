package middleware

import (
	"context"
	"net/http"

	"go-react-backend/contextkeys"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Middleware that adds our connection pool (to access the db) to our request context
func ConnPoolMiddleware(connPool *pgxpool.Pool) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Add connPool to the context
			ctx := context.WithValue(r.Context(), contextkeys.ConnPoolKey, connPool)
			// Call the next handler with the new context
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// Helper function to extract the connection pool from a request context
func GetConnPool(r *http.Request) *pgxpool.Pool {
	return r.Context().Value(contextkeys.ConnPoolKey).(*pgxpool.Pool)
}
