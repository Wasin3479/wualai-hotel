const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByToken = require("../middlewares/authorizeAdminByToken");

const {
    makeListUsers,
    makeGetUser,
    makeCreateUser,
    makeUpdateUser,
    makeChangePassword,
    makeGetUserDetail
} = require("../controllers/admin/users.controller");

module.exports = function buildAdminUsersRouter(pool) {
    const router = express.Router();

    const canManage = authorizeAdminByToken(pool, ["superadmin", "manager"]);
    const canView = authorizeAdminByToken(pool, ["superadmin", "manager", "staff"]);

    router.get("", authenticateToken, canView, makeListUsers(pool));
    router.get("/:id", authenticateToken, canView, makeGetUser(pool));
    router.post("", authenticateToken, canManage, makeCreateUser(pool));
    router.patch("/:id", authenticateToken, canManage, makeUpdateUser(pool));
    router.patch("/:id/password", authenticateToken, canManage, makeChangePassword(pool));
    router.get("/:id/detail", authenticateToken, canView, makeGetUserDetail(pool));

    return router;
};
