const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const { handleCompress } = require("../controllers/compressController");

// POST /api/compress
// "upload.single('file')" means we expect one file field named "file"
router.post("/", upload.single("file"), handleCompress);

module.exports = router;
