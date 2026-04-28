# AGENTS.md — Midorinime Canopy NFT Minting

## Project Context

Project ini adalah **Midorinime**, aplikasi manga/anime yang menggunakan Canopy sebagai appchain untuk minting NFT manga.

NFT di project ini bukan ERC-721 / EVM smart contract. NFT dibuat sebagai **custom transaction type** di Canopy plugin Go.

Flow utama:

```txt
Frontend Mint Button
→ canopy-server.js
→ WSL / Go mint signer
→ Canopy RPC /v1/tx
→ Go Plugin CheckTx
→ Go Plugin DeliverTx
→ NFT disimpan ke plugin state