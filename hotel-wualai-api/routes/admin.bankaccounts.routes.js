const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByToken = require("../middlewares/authorizeAdminByToken");

const {
    makeList,
    makeCreate,
    makeUpdate,
    makeSetDefault,
    makeSetStatus,
    makeRemove,
    makePublicList,
} = require("../controllers/admin/bankaccounts.controller");

module.exports = function buildAdminBankAccountsRouter(pool) {
    const router = express.Router();

    const canView = authorizeAdminByToken(pool, ["superadmin", "manager", "staff"]);
    const canWrite = authorizeAdminByToken(pool, ["superadmin", "manager"]);

    router.get("", authenticateToken, canView, makeList(pool));
    router.post("", authenticateToken, canWrite, makeCreate(pool));
    router.patch("/:id", authenticateToken, canWrite, makeUpdate(pool));
    router.patch("/:id/default", authenticateToken, canWrite, makeSetDefault(pool));
    router.patch("/:id/status", authenticateToken, canWrite, makeSetStatus(pool));
    router.delete("/:id", authenticateToken, canWrite, makeRemove(pool));

    router.get("/public/active", makePublicList(pool));

    return router;
};
