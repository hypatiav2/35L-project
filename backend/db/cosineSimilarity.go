package database

import (
	"database/sql"
	"fmt"
)

// THIS ISNT WORKING SO I THINK WE SHOULD JUST COMPUTE COSINE SIMILARITY IN GO INSTEAD OF REGISTERING A SQLITE FUNCTION

/*
Register a custom sqlite function to compare vectors via cosine similarity

(Function must be registered each time a connection is opened to the database.)
Documentation here: https://pkg.go.dev/github.com/mattn/go-sqlite3
*/

// create a custom SQLite driver with the ConnectHook
func createCustomDriver() {
	// Custom driver to register the cosine_similarity function
	sql.Register("sqlite3_extended",
		&sqlite3.SQLiteDriver{
			ConnectHook: func(conn *sqlite3.SQLiteConn) error {
				// Register the cosine_similarity function
				return conn.RegisterFunc("cosine_similarity", cosineSimilarity, true)
			},
		})
}

// Custom function to calculate cosine similarity
func cosineSimilarity(ctx *sqlite3.Context, args ...sqlite3.Value) {
	if len(args) != 2 {
		ctx.ResultError("Expected two arguments")
		return
	}

	// Dummy implementation for cosine similarity
	vec1 := args[0].Text()
	vec2 := args[1].Text()

	// print out the two vectors
	fmt.Println("Comparing vectors:", vec1, vec2)

	// Placeholder: return a dummy similarity value (change with real logic)
	ctx.ResultFloat(0.85) // Placeholder cosine similarity value
}
