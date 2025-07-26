const express = require("express");
const { Authentication } = require("../middleware/AuthVerify");
const {
  handleCreate,
  handleGet,
  DelteAll,
  getSellerById,
  getTemplatesBySeller,
  updateTemplateStatus,
  deleteTemplate,
} = require("../controller/SellerController");
const upload = require("../middleware/multerConfig"); // Multer middleware

const sellerRouter = express.Router();

// POST - Create a template
sellerRouter.post(
  "/create",
  upload.fields([
    { name: "ProfileImage", maxCount: 1 },
    { name: "sourceCode", maxCount: 1 },
    { name: "demoImages", maxCount: 5 },
  ]),
  handleCreate
);

// GET - Get all templates
sellerRouter.get("/get", handleGet);

// GET - Get one template by ID
sellerRouter.get("/:id", getSellerById);

// GET - Get all templates by seller email
sellerRouter.get("/seller/:email", getTemplatesBySeller);

// PUT - Update template status
sellerRouter.put("/:id/status", updateTemplateStatus);

// DELETE - Delete all templates
sellerRouter.delete("/Delete", DelteAll);

// DELETE - Delete a template by ID
sellerRouter.delete("/:id", Authentication, deleteTemplate);

module.exports = sellerRouter;
