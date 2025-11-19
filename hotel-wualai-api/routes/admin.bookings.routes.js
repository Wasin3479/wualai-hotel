const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByToken = require("../middlewares/authorizeAdminByToken");
const makeCtrl = require("../controllers/admin/bookings.controller");

module.exports = function buildAdminBookingsRouter(pool) {
    const router = express.Router();
    const guardView = authorizeAdminByToken(pool, ["superadmin", "manager", "staff"]);
    const guardManage = authorizeAdminByToken(pool, ["superadmin", "manager"]);

    const {
        listBookings, getBooking, createBooking, updateBooking,
        updateStatus, assignRoom, cancelBooking,
        listRoomTypes, listRooms, listGuestsQuick
    } = makeCtrl(pool);

    // dropdown helpers
    router.get("/room-types", authenticateToken, guardView, listRoomTypes);
    router.get("/rooms", authenticateToken, guardView, listRooms);
    router.get("/guests", authenticateToken, guardView, listGuestsQuick);

    // core
    router.get("/", authenticateToken, guardView, listBookings);
    router.get("/:id", authenticateToken, guardView, getBooking);
    router.post("/", authenticateToken, guardManage, createBooking);
    router.patch("/:id", authenticateToken, guardManage, updateBooking);
    router.patch("/:id/status", authenticateToken, guardManage, updateStatus);
    router.patch("/:id/assign-room", authenticateToken, guardManage, assignRoom);
    router.delete("/:id", authenticateToken, guardManage, cancelBooking);

    return router;
};
