package middlewares

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v4"
	"github.com/joho/godotenv"
)

// middleware that returns http.Handler with JWT verified, or throws an error
// IMPLEMENT LATER: store jwt claims in request context
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//Extract JWT from "Authorization" header: should be formatted "Bearer <token>"
		tokenStr := r.Header.Get("Authorization")
		if tokenStr == "" {
			log.Println("JWT token missing")
			http.Error(w, "Authorization header missing", http.StatusUnauthorized)
			return
		}
		// Parse for our actual token
		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")
		if len(tokenStr) == 0 {
			log.Println("JWT was formatted improperly")
			http.Error(w, "Invalid token format", http.StatusUnauthorized)
			return
		}

		// grab jwtKey from .env (need to store SUPABASE_JWT_SECRET in .env)
		err := godotenv.Load("../.env")
		if err != nil {
			log.Fatalf("Error loading .env file: %v", err)
		}
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

		// lets put jwt claims into request context here

		// If token is valid, call the next handler (we verified JWT!)
		next.ServeHTTP(w, r)
	})
}
