const express = require("express");
const router = express.Router();
const bloodReqController = require("../controllers/bloodReqController");
const verifyToken = require("../middlewares/authMiddleware");

router.post("/dashboard/blood-req", verifyToken, bloodReqController.createBloodReq);
router.get("/bloodReq", bloodReqController.getBloodRequests);
router.get("/bloodReq/:id", bloodReqController.getBloodReqDetails);
router.patch("/bloodReq/:id", verifyToken, bloodReqController.patchBloodReq);
router.patch("/dashboard/bloodReq/edit/:id", verifyToken, bloodReqController.editBloodReq);
router.delete("/bloodReq/:id", verifyToken, bloodReqController.deleteBloodReq);
router.get("/admin/all-blood-requests", verifyToken, bloodReqController.getAdminAllBloodRequests);
router.get("/stats", verifyToken, bloodReqController.getStats);

module.exports = router;
