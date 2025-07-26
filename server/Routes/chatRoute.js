const express = require('express');
const { Authentication } = require('../middleware/AuthVerify');
const { getConversations, getMessages, createConversation, deleteAllMessages, sendMessage } = require('../controller/ChatController');
const upload = require('../middleware/multerConfig');

const chatRouter = express.Router();

chatRouter.get('/conversations', Authentication, getConversations);
chatRouter.get('/messages/:conversationId', Authentication, getMessages);
chatRouter.post('/conversations', Authentication, createConversation);
chatRouter.post('/messages', Authentication, sendMessage);
chatRouter.delete('/messages/:conversationId', Authentication, deleteAllMessages);

// File upload for chat attachments
chatRouter.post('/upload', Authentication, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  res.status(200).json({ success: true, fileUrl: req.file.path, fileType: req.file.mimetype, originalName: req.file.originalname });
});

module.exports = chatRouter; 