package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v4"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

/*
parameter next of type http.Handler -> represents next handler in chain
returns a http.Handler that has had JWT verified
*/
func verifyJWT(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extract JWT from "Authorization" header: should be formatted "Bearer <token>"
		tokenStr := r.Header.Get("Authorization")
		if tokenStr == "" {
			log.Println("JWT token missing")
			http.Error(w, "Authorization header missing", http.StatusUnauthorized)
			return
		}
		// Parse for the actual token
		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")
		if len(tokenStr) == 0 {
			log.Println("JWT was formatted improperly")
			http.Error(w, "Invalid token format", http.StatusUnauthorized)
			return
		}

		// grab jwtKey from .env (need to store SUPABASE_JWT_SECRET in .env)
		jwtKey := []byte(os.Getenv("SUPABASE_JWT_SECRET"))
		if len(jwtKey) == 0 {
			log.Println("JWT secret is missing or empty")
			http.Error(w, "Server configuration error", http.StatusInternalServerError)
			return
		}

		// check token against our jwt key
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			// validate signing method and return the signing key
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return jwtKey, nil
		})
		if err != nil || !token.Valid {
			log.Printf("JWT parsing failed: %v\n", err)
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// If token is valid, call the next handler (we verified JWT!)
		next.ServeHTTP(w, r)
	})
}

func publicRoute(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"message": "You have access to the protected route!"}`)
}

func protectedRoute(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"message": "You have access to the protected route!"}`)
}

func main() {
	// Create multiplexer for routing HTTP requests
	mux := http.NewServeMux()

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	// register public route for root path
	mux.HandleFunc("/", publicRoute)
	// register protected route, wrapped with our verifyJWT middleware
	mux.Handle("/protected", verifyJWT(http.HandlerFunc(protectedRoute)))

	// Cors handler:
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // For now hardcoding in client server
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := corsHandler.Handler(mux)

	// Yippee! Starting our sserver using handler for mux and CORS
	fmt.Println("Server starting on port 8080")
	http.ListenAndServe(":8080", handler)
}
