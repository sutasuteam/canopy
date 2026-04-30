# Canopy NFT Mint Fix

Isi zip ini adalah `rpc_test.go` yang sudah dirapikan agar:

- Tidak ada error `included undefined`
- Tidak ada error `no new variables on left side of :=`
- `TestMintNFT` memakai address `nady` yang punya saldo
- NFT metadata bisa dikirim via environment variable dari `canopy-server.js`

## Cara Pakai

Copy file `rpc_test.go` ke:

```txt
D:\Midori\canopy\plugin\go\tutorial\rpc_test.go
```

Atau dari WSL:

```bash
cp rpc_test.go /mnt/d/Midori/canopy/plugin/go/tutorial/rpc_test.go
```

## Jalankan Test Mint

Pastikan Canopy sudah jalan:

```bash
cd /mnt/d/Midori/canopy
canopy start
```

Terminal kedua:

```bash
cd /mnt/d/Midori/canopy/plugin/go/tutorial
go test -v -run TestMintNFT -timeout 120s
```

## Dengan Environment Variable

```bash
NFT_TOKEN_ID="inkarnasi-123" \
NFT_NAME="Inkarnasi" \
NFT_IMAGE="http://localhost:3000/images/inkarnasi.png" \
NFT_METADATA="Manga access NFT for Inkarnasi" \
go test -v -run TestMintNFT -timeout 120s
```
