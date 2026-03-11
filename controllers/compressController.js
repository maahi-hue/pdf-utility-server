const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { compressPDF, deleteFile } = require("../utils/compress");

/**
 * POST /api/compress
 *
 * Body (multipart/form-data):
 *   - file       : PDF file
 *   - targetSize : "100kb" | "200kb" | "500kb"
 */
async function handleCompress(req, res) {
  const inputPath = req.file?.path;

  // Output file goes in /outputs with a fresh UUID name
  const outputFileName = `compressed-${uuidv4()}.pdf`;
  const outputPath = path.join(__dirname, "../outputs", outputFileName);

  try {
    // ── Validate ──────────────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const targetSize = req.body.targetSize;
    if (!["100kb", "200kb", "500kb"].includes(targetSize)) {
      deleteFile(inputPath);
      return res.status(400).json({ error: "Invalid target size. Use 100kb, 200kb, or 500kb." });
    }

    // ── Compress ──────────────────────────────────────────────────────────
    await compressPDF(inputPath, outputPath, targetSize);

    // ── Send file back ────────────────────────────────────────────────────
    res.download(outputPath, "compressed.pdf", (err) => {
      // Whether download succeeded or failed, delete both files
      deleteFile(inputPath);
      deleteFile(outputPath);

      if (err && !res.headersSent) {
        console.error("Download error:", err.message);
      }
    });

  } catch (err) {
    // Clean up on any error
    deleteFile(inputPath);
    deleteFile(outputPath);

    console.error("Compression failed:", err.message);
    res.status(500).json({ error: "Compression failed. Please try again." });
  }
}

module.exports = { handleCompress };
