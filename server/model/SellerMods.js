const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema(
  {
    sellerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // Removed unique constraint - same seller can have multiple templates
    },
    ProfileImage: {
      type: String, // Assuming the profile picture is stored as a URL
      trim: true,
    },
    templateName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    techStack: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    longDescription: {
      type: String,
      required: true,
      trim: true,
    },
    sourceCode: {
      type: String, 
      trim: true,
    },
    demoURL: {
      type: String,
      trim: true,
    },
    demoImages: {
      type: [String], 
      trim: true,
    },
    license: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    Intro:{
        type:String,
    },
    tags: {
      type: [String], 
    },
    // Add status field for template management
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    // Add view count
    viewCount: {
      type: Number,
      default: 0,
    },
    // Add download count
    downloadCount: {
      type: Number,
      default: 0,
    },

  },
  {
    timestamps: true
  }
);

// Create indexes for better performance
TemplateSchema.index({ email: 1, createdAt: -1 }); // For finding templates by seller
TemplateSchema.index({ category: 1 }); // For filtering by category
TemplateSchema.index({ status: 1 }); // For filtering by status
TemplateSchema.index({ templateName: "text", shortDescription: "text" }); // For search

const Template = mongoose.model("seller", TemplateSchema);
module.exports = Template;
