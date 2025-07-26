const nodemailer = require('nodemailer');

// Check if SMTP is properly configured
const isSMTPConfigured = () => {
  return process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST;
};

// Check if SendGrid is configured
const isSendGridConfigured = () => {
  return process.env.SENDGRID_API_KEY;
};

let transporter = null;

// Initialize transporter based on configuration
if (isSendGridConfigured()) {
  // Use SendGrid
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });
} else if (isSMTPConfigured()) {
  // Use SMTP (Gmail, etc.)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    throw new Error('Email service not configured. Please set up either SendGrid (SENDGRID_API_KEY) or SMTP (SMTP_USER, SMTP_PASS, SMTP_HOST) environment variables.');
  }
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SENDGRID_FROM || process.env.SMTP_USER || 'noreply@yourdomain.com',
    to,
    subject,
    text,
    html,
  };
  
  return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail, isSMTPConfigured, isSendGridConfigured }; 