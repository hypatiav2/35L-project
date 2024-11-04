package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v4"
	"github.com/rs/cors"
)

/*
parameter next of type http.Handler -> represents next handler in chain
returns a http.Handler that has had JWT verified
*/
func verifyJWT(next http.Handler) http.Handler {
	// HTTP handler
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// extract JWT: look for "Authorization" header
		// JWT should be formatted "Bearer <token>"
		tokenStr := r.Header.Get("Authorization")
		// Pls dont be empty
		if tokenStr == "" {
			http.Error(w, "Authorization header missing", http.StatusUnauthorized)
			return
		}

		// Remove "Bearer " prefix from token
		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")

		// Check if it was improperly formatted
		if len(tokenStr) == 0 {
			http.Error(w, "Invalid token format", http.StatusUnauthorized)
			return
		}

		// Parse and verify the JWT
		jwtKey := []byte(os.Getenv("")) // Get your secret from environment variables
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		// if error, returns 401
		if err != nil || !token.Valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// If token is valid, call the next handler (we verified JWT!)
		next.ServeHTTP(w, r)
	})
}

func publicRoute(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello from Go!")
}

func protectedRoute(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "You have access to the protected route!")
}

func main() {
	// Create multiplexer for routing HTTP requests
	mux := http.NewServeMux()

	// register public route for root path
	mux.HandleFunc("/", publicRoute)
	// register protected route, wrapped with our verifyJWT middleware
	mux.Handle("/protected", verifyJWT(http.HandlerFunc(protectedRoute)))

	/*
	   CORS Handler:
	   cors.Default() -> Allows requests from all origins
	   Handler(mux) -> returns new handler with mux
	*/
	handler := cors.Default().Handler(mux)

	// Yippee! Starting our server using handler for mux and CORS
	fmt.Println("Server starting on port 8080")
	http.ListenAndServe(":8080", handler)
}
