const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Maps user-selected target size to Ghostscript quality setting.
 *
 * /screen  → ~72 dpi images  → smallest file  → best for "under 100KB"
 * /ebook   → ~150 dpi images → medium file     → best for "under 200KB"
 * /printer → ~300 dpi images → larger file     → best for "under 500KB"
 */
const QUALITY_MAP = {
  "100kb": "/screen",
  "200kb": "/ebook",
  "500kb": "/printer",
};

/**
 * Compresses a PDF using Ghostscript.
 *
 * @param {string} inputPath  - Absolute path to the uploaded PDF
 * @param {string} outputPath - Absolute path where compressed PDF will be saved
 * @param {string} targetSize - One of: "100kb" | "200kb" | "500kb"
 * @returns {Promise<void>}
 */
function compressPDF(inputPath, outputPath, targetSize) {
  return new Promise((resolve, reject) => {
    const quality = QUALITY_MAP[targetSize] || "/ebook";

    // Ghostscript arguments — same as the CLI command in the roadmap
    const args = [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      `-dPDFSETTINGS=${quality}`,
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ];

    execFile("C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe", args, (error, stdout, stderr) => {
      if (error) {
        console.log("=== GHOSTSCRIPT ERROR ===");
        console.log("error.message:", error.message);
        console.log("stderr:", stderr);
        console.log("stdout:", stdout);
        console.log("========================");
        reject(new Error(`Ghostscript error: ${stderr || error.message}`));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Safely deletes a file. Silently ignores errors (e.g. already deleted).
 */
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Failed to delete file ${filePath}:`, err.message);
  }
}

module.exports = { compressPDF, deleteFile };
