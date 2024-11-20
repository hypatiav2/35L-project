package main

import (
	"database/sql"
	"io/ioutil"
	"log"

	_ "modernc.org/sqlite" // Import the pure Go SQLite driver
)

func main() {
	// Open the database connection
	db, err := sql.Open("sqlite", "./bdate.db") // Use "sqlite" for modernc.org/sqlite
	if err != nil {
		log.Fatalf("Failed to connect to SQLite: %v", err)
	}
	defer db.Close()

	// Execute the schema
	schema, err := ioutil.ReadFile("db/schema.sql")
	if err != nil {
		log.Fatalf("Failed to read schema file: %v", err)
	}
	_, err = db.Exec(string(schema))
	if err != nil {
		log.Fatalf("Failed to execute schema: %v", err)
	}

	// Execute seed data
	seed, err := ioutil.ReadFile("db/seed.sql")
	if err != nil {
		log.Fatalf("Failed to read seed file: %v", err)
	}
	_, err = db.Exec(string(seed))
	if err != nil {
		log.Fatalf("Failed to execute seed data: %v", err)
	}

	log.Println("Database and seed data initialized successfully!")
}
