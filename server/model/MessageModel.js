const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'voice'],
      default: 'text',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    originalName: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    // For response rate calculation
    isInquiry: {
      type: Boolean,
      default: false, // Messages from potential buyers asking about templates
    },
    hasResponse: {
      type: Boolean,
      default: false, // Whether seller responded to this inquiry
    },
    responseTime: {
      type: Number, // Time in hours between inquiry and response
    },
  },
  { timestamps: true }
);

// Index for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ isInquiry: 1, hasResponse: 1 });

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message; 