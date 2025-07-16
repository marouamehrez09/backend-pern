require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Gestion des Congés" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      //html, 
    });
  } catch (error) {
    console.error("Erreur envoi email :", error);
  }
};

module.exports = { sendEmail };
