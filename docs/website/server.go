package main

import (
	"log"
	"net/http"
	"path/filepath"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		switch path {
		case "/":
			path = "/index.html"
		case "/installation", "/install":
			path = "/installation.html"
		case "/css/index.css":
			path = "/css/index.css"
		case "/scripts/releases.js":
			path = "/scripts/releases.js"
		case "/faq":
			path = "/faq.html"
		default:
			path = "404.html"
		}

		file := filepath.Join("public", filepath.FromSlash(path))
		http.ServeFile(w, r, file)
	})

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
