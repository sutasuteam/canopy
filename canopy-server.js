const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/mint-nft", (req, res) => {
  const tokenId = "inkarnasi-" + Date.now();

  const cmd = `cd /mnt/d/Midori/canopy/plugin/go/tutorial && NFT_TOKEN_ID=${tokenId} NFT_NAME="Inkarnasi" NFT_IMAGE="http://localhost:3000/images/inkarnasi.png" NFT_METADATA="Manga access NFT for Inkarnasi" go test -v -run TestMintNFT -timeout 120s`;

  exec(`bash -lc '${cmd}'`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        success: false,
        error: stderr || error.message,
      });
    }

    res.json({
      success: true,
      tokenId,
      output: stdout,
    });
  });
});

app.listen(3001, () => {
  console.log("Canopy mint server running on http://localhost:3001");
});