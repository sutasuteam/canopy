# AGENTS.md — Midorinime AI Manga Video Generator

## Project Overview

Midorinime is a web app that allows users to upload manga images, generate anime-style videos using ComfyUI, and optionally record proof of generation on Canopy Testnet.

Main components:

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- AI engine: ComfyUI API
- Blockchain layer: Canopy Testnet / local Canopy node
- Output: generated `.mp4` video stored in ComfyUI output folder

## Current Architecture

Flow:

1. User uploads manga image from the web UI
2. Frontend sends image to `server.js`
3. `server.js` copies image into ComfyUI input folder
4. `server.js` injects image filename into `Midori.json`
5. `server.js` sends prompt to ComfyUI API
6. ComfyUI generates video
7. `server.js` returns video URL to frontend
8. Frontend displays generated video
9. Future step: send generation metadata to Canopy Testnet

## Local Ports

- Web backend: `http://localhost:3000`
- ComfyUI: `http://127.0.0.1:8188`
- Canopy public RPC: `http://localhost:50002`
- Canopy admin RPC: `http://localhost:50003`

Never expose Canopy admin RPC `50003` publicly.

## Important Files

- `server.js`  
  Express backend that connects frontend to ComfyUI.

- `Midori.json`  
  ComfyUI API workflow.

- `public/index.html`  
  Main frontend page.

- `public/css/style.css`  
  Main styling.

- `public/js/`  
  Frontend scripts.

## ComfyUI Integration Rules

When editing `server.js`:

- Do not remove upload handling.
- Uploaded image must go to:

```txt
D:/Midori/comfyui/input/