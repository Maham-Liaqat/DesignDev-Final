const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

  username: { type: String, required: true },
  rating: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seller", 
    required: true,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
