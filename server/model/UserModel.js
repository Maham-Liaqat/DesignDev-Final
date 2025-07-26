const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // Profile fields
    profileImage: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    website: {
      type: String,
      trim: true,
    },
    socialLinks: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
    },
    stats: {
      templatesUploaded: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      responseRate: { type: Number, default: 0 }, // percentage
      averageResponseTime: { type: Number, default: 0 }, // in hours
      totalReviews: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      joinDate: { type: Date, default: Date.now },
      lastActive: { type: Date, default: Date.now },
    },
    // Add for password reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // Google OAuth fields
    googleId: { type: String, sparse: true },
    isGoogleUser: { type: Boolean, default: false },
  },
  { timestamps: true } 
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
