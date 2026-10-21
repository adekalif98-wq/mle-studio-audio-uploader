import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = new Set([".mp3", ".wav", ".ogg", ".flac"]);
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.has(ext)) return cb(new Error("Format tidak didukung. Gunakan MP3, WAV, OGG, atau FLAC."));
    cb(null, true);
  }
});

function validHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch { return false; }
}

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    service: "MLE STUDIO Audio Uploader",
    robloxConfigured: Boolean(process.env.ROBLOX_API_KEY && process.env.ROBLOX_CREATOR_ID),
    mode: "starter"
  });
});

app.post("/api/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Pilih file audio terlebih dahulu." });

  const title = String(req.body.title || "").trim().slice(0, 100);
  const artist = String(req.body.artist || "").trim().slice(0, 100);
  const sourceUrl = String(req.body.sourceUrl || "").trim().slice(0, 1000);
  const ownerId = String(req.body.ownerId || "").trim().slice(0, 30);
  const rightsConfirmed = req.body.rightsConfirmed === "true";

  if (!title) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: "Judul musik wajib diisi." });
  }
  if (sourceUrl && !validHttpUrl(sourceUrl)) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: "Tautan sumber tidak valid." });
  }
  if (!/^\d{1,30}$/.test(ownerId)) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: "Masukkan Roblox User ID atau Creator ID numerik." });
  }
  if (!rightsConfirmed) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: "Konfirmasi bahwa kamu memiliki hak atau izin menggunakan audio." });
  }

  // Starter intentionally does not download from YouTube/TikTok/Spotify or claim
  // to bypass moderation. Do not log or accept API keys from browser requests.
  const result = {
    status: "ready_for_api_integration",
    title,
    artist,
    ownerId,
    sourceUrl: sourceUrl || null,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    message: process.env.ROBLOX_API_KEY && process.env.ROBLOX_CREATOR_ID
      ? "File diterima. Endpoint upload Open Cloud perlu disesuaikan dengan konfigurasi Creator/izin akun sebelum mengunggah."
      : "File diterima untuk demo. Tambahkan ROBLOX_API_KEY dan ROBLOX_CREATOR_ID sebagai Environment Variables di hosting untuk menyiapkan integrasi API."
  };
  // Temporary uploads are removed after validation to avoid filling free hosting disk.
  fs.unlink(req.file.path, () => {});
  return res.json(result);
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Ukuran file maksimal 20 MB." });
  }
  return res.status(400).json({ error: err.message || "Terjadi kesalahan." });
});

app.listen(PORT, () => console.log(`MLE STUDIO server listening on ${PORT}`));
