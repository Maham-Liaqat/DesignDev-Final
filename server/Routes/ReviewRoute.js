const express = require("express");
const { createReview, getReviewsByTemplate, getReviewsByUser } = require("../controller/ReviewController");
const router = express.Router();

router.post("/create", createReview);
router.get("/template/:templateId", getReviewsByTemplate);
router.get("/user/:email", getReviewsByUser);

module.exports = router;
