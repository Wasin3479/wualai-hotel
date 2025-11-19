const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");

const {
    makeGetMe,
    makeUpdateMyProfile,
    makeChangeMyPassword,
} = require("../controllers/admin/settings.controller");

function ensureAdmin(req, res, next) {
    if (req.user?.typ !== "admin") {
        return res.status(403).json({ message: "สำหรับผู้ดูแลระบบเท่านั้น" });
    }
    next();
}

module.exports = function buildAdminSettingsRouter(pool) {
    const router = express.Router();

    router.get("/me", authenticateToken, ensureAdmin, makeGetMe(pool));
    router.patch("/me/profile", authenticateToken, ensureAdmin, makeUpdateMyProfile(pool));
    router.patch("/me/password", authenticateToken, ensureAdmin, makeChangeMyPassword(pool));

    return router;
};
