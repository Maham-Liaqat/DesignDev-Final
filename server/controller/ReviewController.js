const Review = require("../model/ReviewModel");
const StatsService = require("../services/StatsService");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { username, rating, title, content, templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: "Template ID is required." });
    }

    const newReview = new Review({
      username,
      rating,
      title,
      content,
      seller: templateId, // 👈 map templateId to seller
    });

    await newReview.save();

    // Update seller stats after review
    try {
      const template = await require("../model/SellerMods").findById(templateId);
      if (template) {
        const user = await require("../model/UserModel").findOne({ email: template.email });
        if (user) {
          await StatsService.updateUserStats(user._id);
        }
      }
    } catch (error) {
      console.error("Error updating user stats after review:", error);
    }

    res.status(201).json({ message: "Review created", review: newReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create review" });
  }
};


// Get all reviews
// Get all reviews with populated seller (template) details
// Get reviews for a specific template
exports.getReviewsByTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const reviews = await Review.find({ seller: templateId })
      .populate("seller")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch template-specific reviews" });
  }
};

exports.getReviewsByUser = async (req, res) => {
  try {
    const { email } = req.params;
    const templates = await require("../model/SellerMods").find({ email });
    const templateIds = templates.map(t => t._id);
    const reviews = await Review.find({ seller: { $in: templateIds } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reviews", error: error.message });
  }
};
