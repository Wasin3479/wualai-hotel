const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByToken = require("../middlewares/authorizeAdminByToken");

const {
  makeRevenueReport,
  makeOccupancyReport,
  makeBookingsReport
} = require("../controllers/admin/reports.controller");

module.exports = function buildAdminReportsRouter(pool) {
  const router = express.Router();
  const canView = authorizeAdminByToken(pool, ["superadmin","manager","staff"]);

  router.get("/revenue",   authenticateToken, canView, makeRevenueReport(pool));
  router.get("/occupancy", authenticateToken, canView, makeOccupancyReport(pool));
  router.get("/bookings",  authenticateToken, canView, makeBookingsReport(pool));

  return router;
};
