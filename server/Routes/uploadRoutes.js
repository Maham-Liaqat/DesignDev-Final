const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig"); // Import multer config

// Route for uploading single image (demoImages)
router.post("/upload-single", upload.single("demoImages"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({
    message: "File uploaded successfully",
    filePath: `/uploads/${req.file.filename}`,
  });
});

// Route for uploading single image (ProfileImage)
router.post("/upload-single-profile", upload.single("ProfileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({
    message: "File uploaded successfully",
    filePath: `/uploads/${req.file.filename}`,
  });
});

// Route for uploading multiple images (demoImages array)
router.post("/upload-multiple", upload.array("demoImages", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  const filePaths = req.files.map(file => `/uploads/${file.filename}`);
  res.json({
    message: "Files uploaded successfully",
    filePaths: filePaths,
  });
});

// Route for handling form data with images
router.post("/upload-form", upload.single("demoImages"), (req, res) => {
  const { objectcategory, demoURL, email, license, longDescription, price, sellerName, shortDescription, techStack, templateName, tags } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    message: "Form data received",
    filePath: `/uploads/${req.file.filename}`,
    data: {
      objectcategory,
      demoURL,
      email,
      license,
      longDescription,
      price,
      sellerName,
      shortDescription,
      techStack,
      templateName,
      tags: tags ? JSON.parse(tags) : [],
    },
  });
});

module.exports = router;
