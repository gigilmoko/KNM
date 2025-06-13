const nodemailer = require('nodemailer');

// Gmail configuration only
const mailConfig = {
  gmail: {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'your_gmail@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'your_app_password'
    }
  }
};

// Create Gmail transporter
const createTransporter = () => {
  return nodemailer.createTransport(mailConfig.gmail);
};

module.exports = {
  mailConfig,
  createTransporter
};