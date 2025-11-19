const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByToken = require("../middlewares/authorizeAdminByToken");

const {
    makeList,
    makeGet,
    makeCreate,
    makeUpdate,
    makeToggleStatus,
    makeRemove,
    makeReorder,
} = require("../controllers/admin/slides.controller");

module.exports = function buildAdminSlidesRouter(pool) {
    const router = express.Router();

    const canView = authorizeAdminByToken(pool, ["superadmin", "manager", "staff"]);
    const canManage = authorizeAdminByToken(pool, ["superadmin", "manager"]);

    router.get("/", authenticateToken, canView, makeList(pool));

    router.get("/:id", authenticateToken, canView, makeGet(pool));

    router.post("/", authenticateToken, canManage, makeCreate(pool));

    router.patch("/:id", authenticateToken, canManage, makeUpdate(pool));

    router.patch("/:id/status", authenticateToken, canManage, makeToggleStatus(pool));

    router.put("/reorder", authenticateToken, canManage, makeReorder(pool));

    router.delete("/:id", authenticateToken, canManage, makeRemove(pool));

    return router;
};
