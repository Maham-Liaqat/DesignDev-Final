const nodemailer = require('nodemailer');

// Check if SMTP is properly configured
const isSMTPConfigured = () => {
  return process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST;
};

let transporter = null;

// Initialize transporter only if SMTP is configured
if (isSMTPConfigured()) {
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
    throw new Error('SMTP not configured. Please set SMTP_USER, SMTP_PASS, and SMTP_HOST environment variables.');
  }
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  };
  
  return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail, isSMTPConfigured }; 