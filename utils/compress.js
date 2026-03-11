const { execFile } = require("child_process");
const fs = require("fs");

const QUALITY_MAP = {
  "100kb": "/screen",
  "200kb": "/ebook",
  "500kb": "/printer",
};

function getGsPath() {
  if (process.platform === "win32") {
    return "C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe";
  }
  return "gs"; // Linux (Render Docker)
}

function compressPDF(inputPath, outputPath, targetSize) {
  return new Promise((resolve, reject) => {
    const quality = QUALITY_MAP[targetSize] || "/ebook";
    const gsPath = getGsPath();

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

    console.log("Using Ghostscript:", gsPath);

    execFile(gsPath, args, (error, stdout, stderr) => {
      if (error) {
        console.log("=== GHOSTSCRIPT ERROR ===");
        console.log("error.message:", error.message);
        console.log("stderr:", stderr);
        console.log("========================");
        reject(new Error(`Ghostscript error: ${stderr || error.message}`));
      } else {
        console.log("Compression successful:", outputPath);
        resolve();
      }
    });
  });
}

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error(`Failed to delete ${filePath}:`, err.message);
  }
}

module.exports = { compressPDF, deleteFile };