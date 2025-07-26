const Seller = require("../model/SellerMods");
const User = require("../model/UserModel");
const StatsService = require("../services/StatsService");
const mongoose = require('mongoose');

const handleCreate = async (req, res) => {
  try {
    console.log("[handleCreate] Request received");
    console.log("[handleCreate] req.files:", req.files);
    console.log("[handleCreate] req.body:", req.body);
    const {
      sellerName,
      email,
      templateName,
      category,
      techStack,
      shortDescription,
      longDescription,
      demoURL,
      Intro,
      license,
      price,
      tags,
    } = req.body;
    
    console.log("recived Data",req.body)

    // Handle file uploads
    const ProfileImage = req.files["ProfileImage"]
    ? req.files["ProfileImage"][0].path
    : null;
  const sourceCode = req.files["sourceCode"]
    ? req.files["sourceCode"][0].path
    : null;
  const demoImages = req.files["demoImages"]
    ? req.files["demoImages"].map((file) => file.path)
    : [];

    console.log("[handleCreate] ProfileImage:", ProfileImage);
    console.log("[handleCreate] sourceCode:", sourceCode);
    console.log("[handleCreate] demoImages:", demoImages);

    const newSeller = await Seller.create({
      sellerName,
      email,
      ProfileImage,
      templateName,
      category,
      techStack,
      shortDescription,
      longDescription,
      sourceCode,
      Intro,
      demoURL,
      demoImages,
      license,
      price,
      tags: tags ? tags.split(",") : [], 
    });

    console.log("[handleCreate] New seller created:", newSeller);
    
    // Update user stats after template upload
    try {
      const user = await User.findOne({ email });
      if (user) {
        await StatsService.updateUserStats(user._id);
      }
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
    
    res.status(201).json(newSeller);
    console.log("[handleCreate] Response sent");
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ message: "Failed to create template", error: error.message });
  }
};

const handleGet = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.status(200).json(sellers);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ message: "Failed to fetch sellers" });
  }
};


// Controller: Get single seller by ID
const getSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }
    const seller = await Seller.findById(id)

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json(seller);
  } catch (error) {
    console.error("Error fetching seller:", error);
    res.status(500).json({ message: "Failed to get seller" });
  }
};



const DelteAll = async (req, res) => {
  try {
    const result = await Seller.deleteMany({}); // Correct usage
    res.status(200).json({
      message: 'All sellers deleted successfully',
      deletedCount: result.deletedCount, // Send the number of deleted documents
    });
  } catch (error) {
    console.error('Error deleting all sellers:', error); // Log the actual error
    res.status(500).json({
      message: 'An error occurred while deleting sellers',
      error: error.message, // Send the error message to the client
    });
  }
};

// Get all templates by a specific seller (user)
const getTemplatesBySeller = async (req, res) => {
  try {
    const { email } = req.params;
    
    const templates = await Seller.find({ email })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates by seller:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch templates',
      error: error.message 
    });
  }
};

// Update template status
const updateTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const template = await Seller.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: 'Template not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error updating template status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update template',
      error: error.message 
    });
  }
};

// Delete a template by ID
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Seller.findByIdAndDelete(id);
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.status(200).json({ success: true, message: "Template deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete template", error: error.message });
  }
};

module.exports = { 
  handleCreate,
  getSellerById, 
  handleGet,
  DelteAll,
  getTemplatesBySeller,
  updateTemplateStatus,
  deleteTemplate
};
