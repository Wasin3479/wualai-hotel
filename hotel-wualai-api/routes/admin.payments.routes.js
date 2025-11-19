const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByToken = require("../middlewares/authorizeAdminByToken");
const {
    makeListPending,
    makeListRecent,
    makeGetPayment,
    makeVerify,
} = require("../controllers/admin/payments.controller");

module.exports = function buildAdminPaymentsRouter(pool) {
    const router = express.Router();
    const canView = authorizeAdminByToken(pool, ["superadmin", "manager", "staff"]);
    const canVerify = authorizeAdminByToken(pool, ["superadmin", "manager"]);

    router.get("/pending", authenticateToken, canView, makeListPending(pool));

    router.get("/recent", authenticateToken, canView, makeListRecent(pool));

    router.get("/:id", authenticateToken, canView, makeGetPayment(pool));

    router.patch("/:id/verify", authenticateToken, canVerify, makeVerify(pool));

    return router;
};
