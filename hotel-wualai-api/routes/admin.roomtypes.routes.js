const express = require("express");
const path = require("path");
const multer = require("multer");
const { authenticateToken } = require("../middlewares/authenticateToken");
const authorizeAdminByToken = require("../middlewares/authorizeAdminByToken");
const makeRoomTypesController = require("../controllers/admin/roomtypes.controller");

module.exports = function buildRoomTypesRouter(pool){
  const router = express.Router();
  const ctrl = makeRoomTypesController(pool);
  const canManage = authorizeAdminByToken(pool, ["superadmin", "manager"]);
  const canView   = authorizeAdminByToken(pool, ["superadmin", "manager", "staff"]);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random()*1e9);
      cb(null, unique + path.extname(file.originalname || ""));
    }
  });
  const upload = multer({ storage });

  router.get("", authenticateToken, canView, ctrl.list);
  router.get("/:id", authenticateToken, canView, ctrl.getOne);
  router.post("", authenticateToken, canManage, ctrl.create);
  router.patch("/:id", authenticateToken, canManage, ctrl.update);
  router.patch("/:id/status", authenticateToken, canManage, ctrl.updateStatus);
  router.delete("/:id", authenticateToken, canManage, ctrl.remove);

  router.post("/:id/images", authenticateToken, canManage, upload.array("files", 10), ctrl.addImages);
  router.delete("/:id/images", authenticateToken, canManage, ctrl.removeImage);
  router.put("/:id/images", authenticateToken, canManage, ctrl.setImages);

  return router;
};
