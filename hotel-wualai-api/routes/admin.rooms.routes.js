const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByTokenFactory = require("../middlewares/authorizeAdminByToken");

const {
    makeListRoomTypesForSelect,
    makeListRooms,
    makeGetRoom,
    makeCreateRoom,
    makeUpdateRoom,
    makeUpdateRoomStatus,
    makeDeleteRoom,
} = require("../controllers/admin/rooms.controller");

module.exports = function buildAdminRoomsRouter(pool) {
    const router = express.Router();

    const canView = authorizeAdminByTokenFactory(pool, ["superadmin", "manager", "staff"]);
    const canManage = authorizeAdminByTokenFactory(pool, ["superadmin", "manager"]);

    router.get("/room-types", authenticateToken, canView, makeListRoomTypesForSelect(pool));

    router.get("/", authenticateToken, canView, makeListRooms(pool));

    router.get("/:id", authenticateToken, canView, makeGetRoom(pool));

    router.post("/", authenticateToken, canManage, makeCreateRoom(pool));

    router.patch("/:id", authenticateToken, canManage, makeUpdateRoom(pool));

    router.patch("/:id/status", authenticateToken, canManage, makeUpdateRoomStatus(pool));

    router.delete("/:id", authenticateToken, canManage, makeDeleteRoom(pool));

    return router;
};
