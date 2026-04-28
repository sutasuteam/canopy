package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type MintRequest struct {
	Creator string `json:"creator"`
	TokenID string `json:"token_id"`
	URI     string `json:"uri"`
}

func main() {
	// serve static HTML
	http.Handle("/", http.FileServer(http.Dir("./public")))

	// endpoint mint NFT (dummy untuk test)
	http.HandleFunc("/mint", func(w http.ResponseWriter, r *http.Request) {
		var req MintRequest

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request", 400)
			return
		}

		fmt.Println("🔥 Mint NFT:")
		fmt.Println("Creator:", req.Creator)
		fmt.Println("TokenID:", req.TokenID)
		fmt.Println("URI:", req.URI)

		// nanti ini kamu hubungkan ke RPC 50002
		response := map[string]string{
			"status": "success",
			"token":  req.TokenID,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	fmt.Println("🚀 Server jalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}