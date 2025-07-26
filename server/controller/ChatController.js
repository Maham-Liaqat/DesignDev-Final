const Conversation = require('../model/Conversation');
const Message = require('../model/MessageModel');
const User = require('../model/UserModel');
const StatsService = require('../services/StatsService');

// Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'username profileImage')
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all messages in a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new conversation (if not exists)
const createConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipientId, isInquiry = false } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId], $size: 2 }
    });
    if (!conversation) {
      conversation = await Conversation.create({ participants: [userId, recipientId] });
    }
    
    // If this is an inquiry, mark the first message as inquiry
    if (isInquiry) {
      // Find the first message in this conversation from the sender
      const firstMessage = await Message.findOne({
        conversationId: conversation._id,
        senderId: userId
      }).sort({ createdAt: 1 });
      
      if (firstMessage) {
        await StatsService.markAsInquiry(firstMessage._id);
      }
    }
    
    res.status(200).json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete all messages in a conversation
const deleteAllMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.deleteMany({ conversationId });
    res.status(200).json({ success: true, message: 'All messages deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send a message and update stats if it's a response to an inquiry
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text' } = req.body;
    const senderId = req.user.userId;
    
    // Get conversation to find recipient
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    
    const receiverId = conversation.participants.find(p => p.toString() !== senderId);
    
    // Create the message
    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      content,
      messageType
    });
    
    // Check if this is a response to an inquiry
    const inquiry = await Message.findOne({
      conversationId,
      receiverId: senderId,
      senderId: receiverId,
      isInquiry: true,
      hasResponse: false
    }).sort({ createdAt: -1 });
    
    if (inquiry) {
      // Mark the inquiry as responded to
      await StatsService.markInquiryResponded(inquiry._id, message._id);
      
      // Update seller stats
      await StatsService.updateUserStats(senderId);
    }
    
    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      updatedAt: new Date()
    });
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { 
  getConversations, 
  getMessages, 
  createConversation, 
  deleteAllMessages,
  sendMessage
}; 

