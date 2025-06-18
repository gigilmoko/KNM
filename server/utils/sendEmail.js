const nodemailer = require("nodemailer");
const mailConfig = require("../config/mail");

const sendEmail = async (options) => {
  try {
    // Create a transporter using environment variables directly
    const transporter = nodemailer.createTransport({
      service: "gmail", // or whatever service you're using
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"KNM" <${process.env.GMAIL_USER}>`, // Use environment variable directly
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${options.email}`);
  } catch (error) {
    console.log(`Error sending email: ${error}`);
    // Don't throw an error, just log it to prevent breaking the flow
  }
};

module.exports = sendEmail;