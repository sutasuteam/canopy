Midorinime/
│
├── public/                ← 🌐 Frontend (GitHub Pages root)
│   ├── index.html         ← ⭐ MAIN ENTRY (UI)
│   ├── style.css
│   ├── wallet.js
│   ├── generate.js
│   └── assets/
│
├── server/                ← 🖥️ Backend (Express)
│   └── canopy-server.js   ← API for AI + mint
│
├── signer/                ← 🔐 Mint signer (Go)
│   └── mint-signer.go
│
├── plugin/                ← ⛓️ Canopy plugin (Go FSM)
│   └── contract.go
│
├── comfyui/              ← 🎨 AI (local)
│   ├── input/
│   └── output/
│
├── .gitignore
└── README.md

🎬 Midorinime — Generate & Mint Pipeline

Midorinime provides a complete pipeline from manga → AI-generated video → onchain NFT.

This document explains how video generation and NFT minting work within the system.

🧠 Overview

Midorinime combines:

🎨 ComfyUI → Generates anime-style video
🤖 Gemini AI → Enhances metadata (title, story, tags)
⛓️ Canopy Blockchain → Stores NFTs fully onchain
🎥 Video Generation (AI Pipeline)
📌 What It Does

Transforms a manga image into an anime-style video using local AI.

🔁 Flow
Upload Image (Frontend)
→ Send to Backend (Express.js)
→ Save to ComfyUI input folder
→ Trigger ComfyUI API
→ Generate Video
→ Save output (video file)
→ Return result to frontend
⚙️ Backend Example
// server.js
const axios = require("axios");

async function generateVideo(workflow) {
  const res = await axios.post("http://127.0.0.1:8188/prompt", {
    prompt: workflow
  });

  return res.data.prompt_id;
}
📂 File Paths
ComfyUI Input  → D:/Midori/comfyui/input/
ComfyUI Output → D:/Midori/comfyui/output/
🎬 Output
Format: .mp4 / .webm
Previewable in frontend
Ready to be used as NFT asset
🤖 Gemini AI (Metadata Enhancement)

Before minting, Midorinime uses Gemini AI to generate:

Title
Description
Story summary
Tags

👉 This ensures each NFT has context and narrative, not just media.

🪙 NFT Minting (Onchain)
📌 What It Does

Mints generated content as an NFT using a real blockchain transaction.

⚙️ Transaction Type
mint_nft
type.googleapis.com/types.MessageMintNFT
🔁 Flow
Frontend (Mint Button)
→ Backend (prepare metadata)
→ Mint Signer (Go / executable)
→ Sign transaction
→ Send via RPC :50002
→ Canopy Node
→ Plugin (DeliverTx)
→ StateWrite (NFT stored)
🔐 Mint Signer Responsibilities
Key retrieval (/v1/admin/keystore-get)
Transaction signing
Secure submission
📡 RPC Endpoints
Send Transaction
POST /v1/tx
Query Blockchain
/v1/query/account
/v1/query/height
/v1/query/txs-by-sender
/v1/query/failed-txs
Admin (Local Only)
:50003
🧾 NFT Data Stored Onchain
Title (Gemini AI)
Description
Image (manga input)
Video (generated output)
Creator address
🚀 Full Pipeline
Manga Upload
→ AI Video Generation (ComfyUI)
→ Metadata Enhancement (Gemini AI)
→ NFT Minting (Canopy)
→ Stored Onchain
🔥 Key Highlights
✅ Real blockchain transactions (no simulation)
✅ Fully local AI generation (ComfyUI)
✅ AI-enhanced NFT metadata (Gemini AI)
✅ End-to-end pipeline: AI → Backend → Blockchain
✅ Custom Canopy plugin (Go FSM)

<!-- Thanks -->
