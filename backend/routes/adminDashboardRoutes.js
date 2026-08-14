const express = require("express");
const router = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

const dashboardController = require("../controllers/admin/dashboardController");
router.use(verifyToken, requireAdmin);
router.get("/dashboard", dashboardController.getDashboardStats);

module.exports = router;