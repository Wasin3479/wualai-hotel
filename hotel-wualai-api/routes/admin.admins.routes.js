const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByToken = require("../middlewares/authorizeAdminByToken");

const {
    makeListAdmins,
    makeGetAdmin,
    makeCreateAdmin,
    makeUpdateAdmin,
    makeChangeAdminPassword,
    makeUpdateAdminStatus,
    makeSetAdminRoles,
    makeListAdminRoles,
    makeCreateAdminRole,
    makeUpdateAdminRole,
    makeDeleteAdminRole,
} = require("../controllers/admin/admins.controller");

module.exports = function buildAdminAdminsRouter(pool) {
    const router = express.Router();

    const canView = authorizeAdminByToken(pool, ["superadmin", "manager", "staff"]);
    const canManage = authorizeAdminByToken(pool, ["superadmin"]);

    router.get("", authenticateToken, canView, makeListAdmins(pool));
    router.get("/:id", authenticateToken, canView, makeGetAdmin(pool));
    router.post("", authenticateToken, canManage, makeCreateAdmin(pool));
    router.patch("/:id", authenticateToken, canManage, makeUpdateAdmin(pool));
    router.patch("/:id/password", authenticateToken, canManage, makeChangeAdminPassword(pool));
    router.patch("/:id/status", authenticateToken, canManage, makeUpdateAdminStatus(pool));
    router.put("/:id/roles", authenticateToken, canManage, makeSetAdminRoles(pool));

    router.get("/roles/list", authenticateToken, canView, makeListAdminRoles(pool)); // (list)
    router.post("/roles", authenticateToken, canManage, makeCreateAdminRole(pool));
    router.patch("/roles/:id", authenticateToken, canManage, makeUpdateAdminRole(pool));
    router.delete("/roles/:id", authenticateToken, canManage, makeDeleteAdminRole(pool));

    return router;
};
