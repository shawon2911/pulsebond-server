const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/authMiddleware");

router.patch("/dashboard/profile-update", verifyToken, userController.updateProfile);
router.get("/searchDonor", userController.searchDonor);
router.get("/all-users", userController.getAllUsers);
router.patch("/update-user-status/:id", verifyToken, userController.updateUserStatus);

module.exports = router;
