require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const SIGNER_MINT_URL = "http://127.0.0.1:8080/mint";

app.post("/api/ai-generate", async (req, res) => {
  try {
    const prompt = req.body.prompt || "anime girl";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });

    const result = await model.generateContent(`
      Return ONLY valid JSON. No explanation. No markdown.
      
      Create anime NFT metadata from prompt:
      "${prompt}"
      
      JSON format:
      {
        "name": "short NFT name",
        "description": "short anime NFT description"
      }
      `);
    const text = result.response.text();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "AI response tidak valid JSON",
        raw: text
      });
    }

    res.json({
      success: true,
      data: parsed
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.post("/api/ai-mint", async (req, res) => {
  try {
    const prompt = req.body.prompt || "anime girl";

    
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite"
      });
    

    const result = await model.generateContent(`
Buat NFT anime dari prompt:
"${prompt}"

Return JSON:
{
  "name": "...",
  "description": "..."
}
`);

const text = result.response.text();
console.log("AI RAW:", text);

const jsonText = text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const start = jsonText.indexOf("{");
const end = jsonText.lastIndexOf("}") + 1;

if (start === -1 || end === 0) {
  throw new Error("AI tidak mengembalikan JSON: " + text);
}

const ai = JSON.parse(jsonText.slice(start, end));

    // 🔥 langsung mint ke canopy
    const mintRes = await fetch("http://localhost:8080/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tokenId: "ai-" + Date.now(),
        name: ai.name,
        image: "http://localhost:3001/images/default.png",
        metadata: ai.description
      })
    });

    const mintData = await mintRes.json();

    res.json({
      success: true,
      ai,
      mint: mintData
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.post("/api/mint-nft", async (req, res) => {
  try {
    const tokenId = "inkarnasi-" + Date.now();

    const payload = {
      tokenId,
      name: req.body.name || "Inkarnasi",
      image: req.body.image || "http://localhost:3001/images/inkarnasi.png",
      metadata: req.body.metadata || "Manga access NFT for Inkarnasi",
    };

    console.log("SEND TO SIGNER:", payload);

    const signerRes = await fetch(SIGNER_MINT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await signerRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!signerRes.ok) {
      return res.status(500).json({
        success: false,
        error: data,
      });
    }

    res.json({
      success: true,
      tokenId,
      signer: data,
    });
  } catch (err) {
    console.error("MINT SERVER ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.listen(3001, () => {
  console.log("Canopy mint server running on http://localhost:3001");
});