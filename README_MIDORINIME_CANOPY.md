# MIDORINIME — Panduan Menjalankan Mint NFT ke Canopy

Panduan ini menjelaskan cara menjalankan alur:

```text
Frontend → canopy-server.js → mint-signer.go / mint-signer.exe → RPC Canopy
```

Artinya:

1. **Frontend** menerima input user dan tombol Mint.
2. **canopy-server.js** menjadi backend lokal untuk menerima request dari frontend.
3. **mint-signer.go / mint-signer.exe** membuat dan menandatangani transaksi Canopy.
4. Transaksi dikirim ke **Canopy RPC** di port `50002`.
5. Plugin Canopy memproses transaksi `mint_nft` dan menyimpan NFT ke state blockchain.

---

## 1. Port yang Dipakai

Pastikan port ini benar:

| Service | Port | Fungsi |
|---|---:|---|
| Frontend | biasanya `5500` / Live Server / static | UI web Midorinime |
| Backend Node.js | `3000` | Menangani request dari frontend |
| Canopy RPC | `50002` | Kirim transaksi dan query chain |
| Canopy Admin RPC | `50003` | Keystore lokal, ambil key, buat key |
| Canopy Explorer | `50001` | Explorer lokal |

> Jangan expose `50003` ke publik. Itu admin RPC dan hanya untuk lokal.

---

## 2. Struktur Folder yang Disarankan

Contoh struktur project:

```text
Midorinime/
├─ public/
│  ├─ index.html
│  ├─ style.css
│  └─ mint.js
│
├─ canopy-server.js
├─ mint-signer.go
├─ mint-signer.exe          # hasil build dari mint-signer.go, khusus Windows
├─ package.json
└─ README.md
```

Kalau frontend kamu tidak ada di folder `public`, sesuaikan bagian ini di `canopy-server.js`:

```js
app.use(express.static("public"));
```

---

## 3. Pastikan Canopy Node Sudah Jalan

Buka terminal pertama, masuk ke folder repo Canopy:

```bash
cd D:/path/ke/canopy
canopy start
```

Pastikan log menunjukkan node jalan dan plugin connect.

Contoh log yang bagus:

```text
plugin connected
```

Kalau plugin belum connect, cek config:

```text
~/.canopy/config.json
```

Pastikan ada:

```json
{
  "plugin": "go",
  "rpcPort": "50002",
  "adminPort": "50003"
}
```

Jika plugin Go belum dibuild:

```bash
cd plugin/go
make build
```

Lalu jalankan ulang:

```bash
canopy start
```

---

## 4. Cek RPC Canopy

Buka terminal baru dan cek tinggi block:

```bash
canopy query height or curl -X POST http://localhost:50002/v1/query/height \
  -H "Content-Type: application/json" \
  -d '{}'
```

Kalau berhasil, akan muncul seperti:

```json
{
  "height": 12
}
```

Kalau gagal:

- Pastikan `canopy start` masih jalan.
- Pastikan port benar: `50002`.
- Pastikan tidak ada firewall yang memblokir localhost.

---

## 5. Cek Admin Keystore

Cek key lokal:

```bash
curl http://localhost:50003/v1/admin/keystore
```

Atau jika pakai CLI:

```bash
canopy admin ks
```

Biasanya ada key bernama:

```text
validator
```

Address validator inilah yang dipakai sebagai minter/signer lokal.

---

## 6. Build mint-signer.go Menjadi mint-signer.exe

Kalau kamu di Windows, build seperti ini:

```bash
go build -o mint-signer.exe mint-signer.go
```

Kalau di Linux/Mac:

```bash
go build -o mint-signer mint-signer.go
```

Cek hasilnya:

```bash
ls
```

Harus ada:

```text
mint-signer.exe
```

atau:

```text
mint-signer
```

---

## 7. Install Dependency Backend Node.js

Di folder project Midorinime:

```bash
npm init -y
npm install express cors axios
```

Jika `canopy-server.js` memakai `multer`, install juga:

```bash
npm install multer
```

Contoh `package.json` minimal:

```json
{
  "name": "midorinime-canopy",
  "version": "1.0.0",
  "main": "canopy-server.js",
  "scripts": {
    "start": "node canopy-server.js"
  },
  "dependencies": {
    "axios": "latest",
    "cors": "latest",
    "express": "latest",
    "multer": "latest"
  }
}
```

---

## 8. Jalankan canopy-server.js

Buka terminal kedua di folder Midorinime:

```bash
cd D:/path/ke/Midorinime
npm start
```

Atau langsung:

```bash
node canopy-server.js
```

Jika berhasil, harus muncul seperti:

```text
Canopy server running on http://localhost:3000
```

---

## 9. Alur Backend yang Benar

`canopy-server.js` harus menerima request dari frontend, lalu memanggil `mint-signer.exe`.

Contoh alurnya:

```text
Frontend klik Mint
↓
POST http://localhost:3000/api/mint
↓
canopy-server.js menerima name, image, metadata
↓
canopy-server.js menjalankan mint-signer.exe
↓
mint-signer.exe sign transaction
↓
Transaksi dikirim ke http://localhost:50002/v1/tx
↓
Canopy plugin menerima mint_nft
↓
NFT tersimpan on-chain
```

---

## 10. Contoh Endpoint Frontend

Di `mint.js`, frontend bisa mengirim request seperti ini:

```js
async function mintNFT() {
  const payload = {
    creator: "validator",
    name: "Midorinime NFT",
    image: "https://example.com/image.png",
    metadata: JSON.stringify({
      app: "Midorinime",
      type: "manga-video-generation"
    })
  };

  const res = await fetch("http://localhost:3000/api/mint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log(data);

  if (data.ok) {
    alert("NFT berhasil dikirim ke Canopy! TX: " + data.txHash);
  } else {
    alert("Mint gagal: " + data.error);
  }
}
```

Button HTML:

```html
<button onclick="mintNFT()">Mint NFT</button>
```

---

## 11. Cara Menjalankan Semua dari Nol

Jalankan berurutan seperti ini.

### Terminal 1 — Canopy Node

```bash
cd D:/path/ke/canopy
canopy start
```

Biarkan terminal ini tetap terbuka.

---

### Terminal 2 — Backend Midorinime

```bash
cd D:/path/ke/Midorinime
npm start
```

Biarkan terminal ini tetap terbuka.

---

### Terminal 3 — Frontend

Kalau pakai VS Code Live Server:

```text
Klik kanan index.html → Open with Live Server
```

Atau kalau frontend diserve dari Express:

```text
Buka http://localhost:3000
```

---

## 12. Cara Test Manual Tanpa Frontend

Kamu bisa test backend langsung dengan `curl`:

```bash
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "creator":"validator",
    "name":"Test NFT",
    "image":"https://example.com/test.png",
    "metadata":"{\"source\":\"manual-test\"}"
  }'
```

Kalau berhasil, response seharusnya mirip:

```json
{
  "ok": true,
  "txHash": "...",
  "result": "submitted"
}
```

---

## 13. Cara Cek Transaksi Berhasil atau Gagal

Cek block height:

```bash
curl http://localhost:50002/v1/query/height
```

Cek failed transactions:

```bash
curl http://localhost:50002/v1/query/failed-txs
```

Kalau transaksi masuk failed, baca error-nya. Biasanya masalah ada di:

- `messageType` tidak cocok.
- `type_url` salah.
- Signature salah.
- Address signer tidak sama dengan `AuthorizedSigners` di plugin.
- Fee kurang.
- Plugin belum support `mint_nft`.

---

## 14. Error Umum dan Solusi

### Error: `connect ECONNREFUSED 127.0.0.1:50002`

Artinya backend tidak bisa konek ke RPC Canopy.

Solusi:

```bash
canopy start
```

Lalu cek:

```bash
curl http://localhost:50002/v1/query/height
```

---

### Error: `mint-signer.exe not found`

Artinya `canopy-server.js` tidak menemukan file signer.

Solusi:

- Pastikan `mint-signer.exe` ada di folder yang sama dengan `canopy-server.js`.
- Atau ubah path di `canopy-server.js`.

Contoh Windows:

```js
const signerPath = path.join(__dirname, "mint-signer.exe");
```

Contoh Linux/Mac:

```js
const signerPath = path.join(__dirname, "mint-signer");
```

---

### Error: `plugin not connected`

Solusi:

1. Cek `~/.canopy/config.json`.
2. Pastikan:

```json
{
  "plugin": "go"
}
```

3. Build plugin:

```bash
cd D:/path/ke/canopy/plugin/go
make build
```

4. Jalankan ulang:

```bash
canopy start
```

---

### Error: `invalid message cast` atau `unknown tx`

Artinya transaksi yang dikirim tidak cocok dengan plugin.

Cek di plugin:

```go
SupportedTransactions: []string{
  "send",
  "mint_nft",
},

TransactionTypeUrls: []string{
  "type.googleapis.com/types.MessageSend",
  "type.googleapis.com/types.MessageMintNFT",
},
```

Urutan dua array itu harus sama.

---

### Error: signature invalid

Biasanya karena signer menandatangani data yang salah.

Yang benar:

```text
sign bytes = protobuf Transaction dengan signature kosong
```

Yang salah:

```text
sign JSON
```

Jadi `mint-signer.go` harus sign protobuf bytes, lalu body HTTP dikirim dalam bentuk JSON/protojson.

---

## 15. Checklist Sebelum Klik Mint

Pastikan semua ini sudah benar:

- [ ] `canopy start` jalan.
- [ ] RPC `50002` bisa diakses.
- [ ] Admin RPC `50003` bisa diakses secara lokal.
- [ ] Plugin sudah connect.
- [ ] Plugin support `mint_nft`.
- [ ] `mint-signer.exe` sudah dibuild.
- [ ] `canopy-server.js` jalan di port `3000`.
- [ ] Frontend mengirim request ke `http://localhost:3000/api/mint`.
- [ ] Address signer sama dengan address yang diminta plugin.
- [ ] Fee cukup.
- [ ] Setelah mint, cek `/v1/query/failed-txs`.

---

## 16. Ringkasan Singkat

Untuk menjalankan Midorinime minting ke Canopy:

```bash
# Terminal 1
cd D:/path/ke/canopy
canopy start

# Terminal 2
cd D:/path/ke/Midorinime
npm start

# Terminal 3
buka frontend lalu klik Mint NFT
```

Alur sukses:

```text
Klik Mint
→ Frontend kirim data NFT
→ canopy-server.js menerima request
→ mint-signer.exe membuat signed tx
→ tx dikirim ke Canopy RPC :50002
→ plugin menjalankan DeliverTx mint_nft
→ NFT tersimpan on-chain
```

