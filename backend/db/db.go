package database

import (
	"database/sql"
	"log"
	"sync"

	_ "github.com/mattn/go-sqlite3"
)

var (
	db   *sql.DB
	once sync.Once
)

func GetDB() *sql.DB {
	once.Do(func() {
		var err error
		db, err = sql.Open("sqlite3", "./bdate.db")
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
	})

	return db
}

func CloseDB() {
	if db != nil {
		db.Close()
	}
}
