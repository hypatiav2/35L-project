package db

import (
    "database/sql"
    "fmt"
    "io/ioutil"
    "log"
    "sync"

    _ "modernc.org/sqlite" // Use the pure Go SQLite driver
)

var (
    instance *sql.DB
    once     sync.Once
)

// InitializeDB connects to the database and executes the schema.
func InitializeDB(dbPath string, schemaPath string) error {
    var err error
    once.Do(func() {
        instance, err = sql.Open("sqlite", dbPath) // "sqlite" for modernc.org/sqlite
        if err != nil {
            return
        }

        // Read and execute the schema file
        schema, readErr := ioutil.ReadFile(schemaPath)
        if readErr != nil {
            err = fmt.Errorf("failed to read schema file: %v", readErr)
            return
        }

        _, execErr := instance.Exec(string(schema))
        if execErr != nil {
            err = fmt.Errorf("failed to execute schema: %v", execErr)
            return
        }
        log.Println("Database initialized successfully")
    })

    return err
}

// GetDB returns the database instance.
func GetDB() *sql.DB {
    return instance
}

// CloseDB closes the database connection.
func CloseDB() {
    if instance != nil {
        instance.Close()
        log.Println("Database connection closed")
    }
}
