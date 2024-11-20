package main

import (
    "database/sql"
    "io/ioutil"
    "log"

    _ "github.com/mattn/go-sqlite3"
)

func main() {
    db, err := sql.Open("sqlite3", "./bdate.db")
    if err != nil {
        log.Fatalf("Failed to connect to SQLite: %v", err)
    }
    defer db.Close()

    // Execute schema
    schema, _ := ioutil.ReadFile("schema.sql")
    _, err = db.Exec(string(schema))
    if err != nil {
        log.Fatalf("Failed to execute schema: %v", err)
    }

    // Execute seed data
    seed, _ := ioutil.ReadFile("seed.sql")
    _, err = db.Exec(string(seed))
    if err != nil {
        log.Fatalf("Failed to execute seed data: %v", err)
    }

    log.Println("Database and seed data initialized successfully!")
}
