package repositories

import (
	// "fmt"
	"log"
	"github.com/jackc/pgx/v5"
    "github.com/joho/godotenv"
)

// struct that represents a profile in our database TEMP RN NOT ACCURATE
type Profile struct {
	userID  string `json:"id"`
	userName string `json: "username"`
	FullName  string `json:"name"`
	bio string `json:"bio"`
	Avatar string `json:"link"`
	goals string `json:"goals"`
}

func load_env() {
    // Load environment variables
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    databaseUrl := os.Getenv("DATABASE_URL")

    // Connect to Supabase database
    conn, err := pgx.Connect(context.Background(), databaseUrl)
    if err != nil {
        log.Fatal("Unable to connect to database:", err)
    }
    defer conn.Close(context.Background())
    fmt.Println("Connected to Supabase!")
}