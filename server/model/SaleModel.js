const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'seller',
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer'],
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
SaleSchema.index({ sellerId: 1, createdAt: -1 });
SaleSchema.index({ templateId: 1 });
SaleSchema.index({ status: 1 });

const Sale = mongoose.model("Sale", SaleSchema);
module.exports = Sale; 