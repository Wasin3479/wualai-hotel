const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByToken = require("../middlewares/authorizeAdminByToken");
const {
  makeListBookings,
  makeListPendingPayments,
} = require("../controllers/admin/adminDashboardController");

module.exports = function adminDashboardRoutes(pool) {
  const router = express.Router();

  router.get(
    "/bookings",
    authenticateToken,
    authorizeAdminByToken(pool, ["superadmin", "manager", "staff"]),
    makeListBookings(pool)
  );

  router.get(
    "/payments/pending",
    authenticateToken,
    authorizeAdminByToken(pool, ["superadmin", "manager"]),
    makeListPendingPayments(pool)
  );

  return router;
};
