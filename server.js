const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const http = require("http");

const app = express();

const COMFY_INPUT = "D:/Midori/comfyui/input/";
const COMFY_OUTPUT = "D:/Midori/comfyui/output/";
const COMFY_API = "http://127.0.0.1:8188";

const axiosClient = axios.create({
  timeout: 0,
  httpAgent: new http.Agent({ keepAlive: false }),
  maxBodyLength: Infinity,
  maxContentLength: Infinity
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/output", express.static(COMFY_OUTPUT));

const upload = multer({ dest: COMFY_INPUT });

app.post("/generate", upload.single("image"), async (req, res) => {
  req.setTimeout(0);
  res.setTimeout(0);

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Gambar belum diupload" });
    }

    const ext = path.extname(req.file.originalname) || ".png";
    const newFileName = `${req.file.filename}${ext}`;
    const newPath = path.join(COMFY_INPUT, newFileName);

    fs.renameSync(req.file.path, newPath);

    const workflow = JSON.parse(fs.readFileSync("./Midori.json", "utf-8"));
    workflow["20"]["inputs"]["image"] = newFileName;

    console.log("Kirim prompt ke ComfyUI...");

    const response = await axiosClient.post(`${COMFY_API}/prompt`, {
      prompt: workflow
    });

    const promptId = response.data.prompt_id;
    console.log("Prompt ID:", promptId);

    let outputFile = null;
    let attempts = 0;
    const maxAttempts = 900;

    while (!outputFile && attempts < maxAttempts) {
      try {
        const historyRes = await axiosClient.get(`${COMFY_API}/history/${promptId}`);
        const promptHistory = historyRes.data[promptId];

        if (promptHistory && promptHistory.outputs) {
          for (const nodeId in promptHistory.outputs) {
            const output = promptHistory.outputs[nodeId];

            if (output.videos && output.videos.length > 0) {
              outputFile = output.videos[0].filename;
              break;
            }

            if (output.gifs && output.gifs.length > 0) {
              outputFile = output.gifs[0].filename;
              break;
            }
          }
        }
      } catch (pollErr) {
        console.log("Polling ulang...", pollErr.message);
      }

      if (!outputFile) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
      }
    }

    if (!outputFile) {
      return res.status(500).json({
        error: "Output video tidak ditemukan"
      });
    }

    console.log("Video selesai:", outputFile);

    res.json({
      video: `http://localhost:3000/output/${outputFile}`
    });

  } catch (err) {
    console.error("GENERATE ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message || "error generate"
    });
  }
});

const server = app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});

server.timeout = 0;