const User = require("../model/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Seller = require("../model/SellerMods");
const Review = require("../model/ReviewModel");
const StatsService = require("../services/StatsService");
const crypto = require("crypto");
const { sendEmail, isSMTPConfigured, isSendGridConfigured } = require("../services/emailService");

// ✅ Signup Controller
const HandleSignup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  try {
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(409).json({ success: false, error: "Email already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully!" ,newUser});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Login Controller
const HandleLogin = async (req, res) => {
  try {
    let { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: "Username/email and password are required" });
    }
    password = String(password);
    // Find user by email or username
    const findUser = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    });
    if (!findUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: findUser._id, email: findUser.email },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      username: findUser.username,
      userId: findUser._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get User Profile (public)
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update Own Profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Set by auth middleware
    const updateFields = { ...req.body };
    // Prevent password/email update here for security
    delete updateFields.password;
    delete updateFields.email;

    // Handle profile image upload
    if (req.file) {
      updateFields.profileImage = req.file.path;
    }

    // Handle socialLinks as an object if sent as flat fields
    if (updateFields['socialLinks.github'] || updateFields['socialLinks.linkedin'] || updateFields['socialLinks.twitter']) {
      updateFields.socialLinks = {
        github: updateFields['socialLinks.github'] || '',
        linkedin: updateFields['socialLinks.linkedin'] || '',
        twitter: updateFields['socialLinks.twitter'] || '',
      };
      delete updateFields['socialLinks.github'];
      delete updateFields['socialLinks.linkedin'];
      delete updateFields['socialLinks.twitter'];
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get User Template Stats (count and average rating)
const getUserTemplateStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Use StatsService to get comprehensive stats
    const stats = await StatsService.calculateAllStats(userId);
    
    res.status(200).json({ 
      success: true, 
      templateCount: stats.templatesUploaded, 
      avgRating: stats.averageRating.toFixed(2),
      totalSales: stats.totalSales,
      totalRevenue: stats.totalRevenue,
      responseRate: stats.responseRate,
      averageResponseTime: stats.averageResponseTime
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user by email (for chat)
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user by username
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get comprehensive user stats
const getUserComprehensiveStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const stats = await StatsService.getUserDetailedStats(userId);
    
    res.status(200).json({ 
      success: true, 
      stats,
      user: {
        username: user.username,
        profileImage: user.profileImage,
        bio: user.bio,
        location: user.location,
        socialLinks: user.socialLinks,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    
    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    // Create reset link
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, ''); // Remove trailing slash
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    // Debug logging
    console.log('Password reset request for:', user.email);
    console.log('Frontend URL:', frontendUrl);
    console.log('Reset link:', resetLink);
    
    // Try to send email if email service is configured
    if (isSMTPConfigured() || isSendGridConfigured()) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Password Reset Request - DesignDev",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>Hello ${user.username || 'there'},</p>
              <p>You requested a password reset for your DesignDev account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #4e8cff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
              </div>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">This is an automated message from DesignDev. Please do not reply to this email.</p>
            </div>
          `,
          text: `Password Reset Request\n\nHello ${user.username || 'there'},\n\nYou requested a password reset for your DesignDev account.\n\nReset your password: ${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this password reset, please ignore this email.`
        });
        res.status(200).json({ 
          success: true, 
          message: "Password reset link sent to your email." 
        });
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr);
        // Fallback: return success with reset link for manual testing
        res.status(200).json({ 
          success: true, 
          message: "Password reset link generated successfully.",
          resetLink: resetLink,
          note: "Email service not configured. Use the reset link above."
        });
      }
    } else {
      // No SMTP configured - return reset link for testing
      console.log("Password reset link for testing:", resetLink);
      res.status(200).json({ 
        success: true, 
        message: "Password reset link generated successfully.",
        resetLink: resetLink,
        note: "Email service not configured. Use the reset link above for testing."
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to process password reset request. Please try again." 
    });
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, error: "Token and new password are required" });
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ success: true, message: "Password has been reset successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { 
  HandleSignup, 
  HandleLogin, 
  getUserProfile, 
  updateUserProfile, 
  getUserTemplateStats, 
  getUserByEmail,
  getUserByUsername,
  getUserComprehensiveStats,
  forgotPassword,
  resetPassword,
};
