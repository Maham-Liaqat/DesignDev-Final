const express = require("express");
const router = express.Router();
const { Authentication } = require("../middleware/AuthVerify");
const {
  createSale,
  getSellerSales,
  getSalesStats,
  updateSaleStatus,
  getUserDetailedStats,
  updateUserStats
} = require("../controller/SalesController");

// All routes require authentication
router.use(Authentication);

// Sales management routes
router.post("/create", createSale);
router.get("/seller", getSellerSales);
router.get("/stats", getSalesStats);
router.put("/:saleId/status", updateSaleStatus);

// Stats routes
router.get("/user/:userId/stats", getUserDetailedStats);
router.post("/user/stats/update", updateUserStats);

module.exports = router; 