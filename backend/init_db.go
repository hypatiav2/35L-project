package main

import (
	"database/sql"
	"io/ioutil"
	"log"
	"os"

	_ "modernc.org/sqlite" // Import the pure Go SQLite driver
)

/*
Script to initialize our sqlite database. Find a better way of initializing through main later?
*/
func main() {
	// Path to the SQLite database file
	dbPath := "./bdate.db"

	// Check if the database file already exists
	if _, err := os.Stat(dbPath); err == nil {
		// If file exists, delete it (overwrite it)
		err := os.Remove(dbPath)
		if err != nil {
			log.Fatalf("Failed to delete existing database file: %v", err)
		}
		log.Println("Existing database file deleted. Creating a new one...")
	}

	// Open the database connection (creates a new file if it doesn't exist)
	db, err := sql.Open("sqlite", dbPath)
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
