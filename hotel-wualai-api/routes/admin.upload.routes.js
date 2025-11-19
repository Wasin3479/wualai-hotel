const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByToken = require("../middlewares/authorizeAdminByToken");

module.exports = function buildAdminUploadRouter(pool) {
    const router = express.Router();

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || "");
            const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
            cb(null, name);
        },
    });
    const upload = multer({ storage });

    const canUpload = authorizeAdminByToken(pool, ["superadmin", "manager", "staff"]);

    router.post("/", authenticateToken, canUpload, upload.single("file"), async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ (field: file)" });

            const [r] = await pool.execute(
                "INSERT INTO files (bucket, object_key, mime_type, size_bytes) VALUES (?, ?, ?, ?)",
                ["admin", req.file.filename, req.file.mimetype, req.file.size]
            );

            return res.status(201).json({
                id: r.insertId,
                path: `/uploads/${req.file.filename}`,
                mime: req.file.mimetype,
                size: req.file.size,
            });
        } catch (e) {
            console.error("admin upload error:", e);
            res.status(500).json({ message: "อัปโหลดไม่สำเร็จ" });
        }
    });

    return router;
};
