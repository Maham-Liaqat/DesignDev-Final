const express = require("express");
const cors = require("cors");
const { Database } = require("./Database/database");
const dotenv = require('dotenv');
const path = require("path");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use environment variable
const http = require("http");
const Conversation = require("./model/Conversation");
const Message = require("./model/MessageModel");

const userRoute = require("./Routes/userRoute");
const sellerRouter = require("./Routes/SellerRoute");
const uploadRoutes = require("./Routes/uploadRoutes");
const reviewRouter = require("./Routes/ReviewRoute");
const chatRouter = require("./Routes/chatRoute");
const salesRouter = require("./Routes/salesRoute");

dotenv.config()
const app = express();
const server = http.createServer(app); // For Socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

// Add this global logger middleware near the top, after requiring express and before routes
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const PORT = process.env.PORT || 8080;

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a simple route to list uploads directory
app.get('/uploads', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      res.json({ 
        message: 'Uploads directory contents',
        files: files,
        count: files.length
      });
    } else {
      res.json({ 
        message: 'Uploads directory does not exist',
        files: [],
        count: 0
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/", uploadRoutes);
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Api Route
app.get("/", (req, res) => {
    res.send("You are on the correct PORT");
    console.log("Hello World");
});

app.use("/api/reviews", reviewRouter);
app.use("/api/chat", chatRouter);
app.use("/api/sales", salesRouter);

// Debug endpoint to check template data
app.get("/debug/template/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Seller = require("./model/SellerMods");
    const template = await Seller.findById(id);
    
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    // Check if source code file exists
    const fs = require('fs');
    const filePath = path.join(__dirname, template.sourceCode);
    const fileExists = fs.existsSync(filePath);
    
    res.json({
      _id: template._id,
      templateName: template.templateName,
      sourceCode: template.sourceCode,
      email: template.email,
      sellerName: template.sellerName,
      fileExists: fileExists,
      filePath: filePath
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fix template endpoint - remove sourceCode if file doesn't exist
app.post("/fix/template/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Seller = require("./model/SellerMods");
    const template = await Seller.findById(id);
    
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    // Check if source code file exists
    const fs = require('fs');
    const filePath = path.join(__dirname, template.sourceCode);
    const fileExists = fs.existsSync(filePath);
    
    if (!fileExists && template.sourceCode) {
      // Remove the sourceCode field since file doesn't exist
      await Seller.findByIdAndUpdate(id, { $unset: { sourceCode: 1 } });
      
      res.json({
        message: "Template fixed - sourceCode removed",
        templateId: id,
        previousSourceCode: template.sourceCode,
        fileExists: false
      });
    } else {
      res.json({
        message: "Template is fine",
        templateId: id,
        fileExists: fileExists
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payment/create-session', async (req, res) => {
  try {
    console.log('Received payment request:', req.body); // Debug log

    const { price, sellerName, sourcePath ,templateId} = req.body;

    // Validate required fields
    if (!price || !sellerName) {
      throw new Error('Price and seller name are required');
    }

    // Convert price to cents with validation
    const amountInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(amountInCents) || amountInCents <= 0) {
      throw new Error('Invalid price');
    }

    // Build success URL safely - use production URL for deployed app
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://design-dev-final.vercel.app/' 
      : 'http://localhost:5173/';
    let successUrl;
    
    if (sourcePath && typeof sourcePath === 'string') {
      const filename = sourcePath.split(/\\|\//).pop(); // Extract just the file name
      successUrl = `${baseUrl}success?sourcePath=${encodeURIComponent(filename)}&templateId=${templateId}`;
    } else {
      successUrl = `${baseUrl}success?templateId=${templateId}`;
    }
    

    console.log('Constructed success URL:', successUrl); // Debug log

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'pkr', // Changed from 'usd' to 'pkr'
          product_data: {
            name: `Template from ${sellerName}`,
            description: 'Digital template download',
          },
          unit_amount: amountInCents, // price in paisa
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: process.env.NODE_ENV === 'production' 
        ? 'https://design-dev-final.vercel.app/' 
        : 'http://localhost:5173/',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(400).json({ 
      error: error.message || 'Payment processing failed' 
    });
  }
});

// UserRoute
app.use("/", userRoute);
app.use("/", sellerRouter);

// Add this global error handler after all routes
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

// --- SOCKET.IO CHAT LOGIC ---
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Typing indicator
  socket.on("typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("typing", { userId });
  });

  socket.on("stop_typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("stop_typing", { userId });
  });

  // Send message
  socket.on("send_message", async (data) => {
    console.log("Received send_message data:", data);
    // data: { conversationId, senderId, content, fileUrl, fileType, originalName }
    const { conversationId, senderId, content, fileUrl, fileType, originalName } = data;
    
    try {
      // Guard clause: prevent empty content
      if (!content || !content.trim()) {
        console.error('Cannot send empty content:', content);
        return;
      }
      // Get conversation to find receiverId
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        console.error('Conversation not found:', conversationId);
        return;
      }
      
      // Find receiverId (the other participant)
      const receiverId = conversation.participants.find(p => p.toString() !== senderId);
      if (!receiverId) {
        console.error('Receiver not found in conversation');
        return;
      }
      
      // Determine content and messageType
      let messageType = 'text';
      
      if (fileUrl) {
        if (fileType && fileType.startsWith('image/')) {
          messageType = 'image';
        } else if (fileType && fileType.startsWith('audio/')) {
          messageType = 'voice';
        } else {
          messageType = 'file';
        }
      }
      
    // Save message to DB
    const message = await Message.create({
      conversationId,
      senderId,
        receiverId,
        content,
        messageType,
        ...(fileUrl && { fileUrl }),
        ...(fileType && { fileType }),
        ...(originalName && { originalName })
      });
      
    // Update conversation lastMessage and updatedAt
      const lastMessageText = content || (messageType === 'image' ? '📷 Image' : messageType === 'voice' ? '🎤 Voice Note' : messageType === 'file' ? '📎 File' : '');
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: lastMessageText,
      updatedAt: new Date()
    });
      
    // Emit to all in room
    io.to(conversationId).emit("receive_message", message.toObject({ getters: true, virtuals: false }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Read receipt
  socket.on("read_messages", async ({ conversationId, userId }) => {
    // Mark all messages as read for this user in this conversation
    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    io.to(conversationId).emit("messages_read", { conversationId, userId });
  });

  // Edit message
  socket.on("edit_message", async ({ messageId, newText }) => {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $set: { content: newText, edited: true } },
      { new: true }
    );
    if (message) {
      io.to(message.conversationId.toString()).emit("message_edited", message);
    }
  });

  // Delete message
  socket.on("delete_message", async ({ messageId }) => {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $set: { deleted: true, content: '' } },
      { new: true }
    );
    if (message) {
      io.to(message.conversationId.toString()).emit("message_deleted", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// --- START SERVER ---
const startServer = async () => {
  try {
    Database();
    server.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};
startServer();