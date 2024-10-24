package main

import (
    "fmt"
    "net/http"
    "github.com/rs/cors"
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello from Go backend!")
    })
    
    handler := cors.Default().Handler(mux)
    
    fmt.Println("Server starting on port 8080")
    http.ListenAndServe(":8080", handler)
}
