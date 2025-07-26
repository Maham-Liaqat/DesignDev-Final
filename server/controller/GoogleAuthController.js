const { OAuth2Client } = require('google-auth-library');
const User = require('../model/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        error: 'Google credential is required' 
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      const username = name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
      
      user = new User({
        username,
        email,
        password: await bcrypt.hash(googleId + process.env.SECRET_KEY, 10), // Use googleId as password base
        profileImage: picture,
        googleId,
        isGoogleUser: true
      });

      await user.save();
    } else {
      // Update existing user's Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.isGoogleUser = true;
        if (!user.profileImage) {
          user.profileImage = picture;
        }
        await user.save();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: user.isGoogleUser ? 'Google login successful' : 'Google signup successful',
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        isGoogleUser: user.isGoogleUser
      },
      token
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Google authentication failed' 
    });
  }
};

module.exports = {
  googleLogin
};