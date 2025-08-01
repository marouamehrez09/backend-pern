require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  //host: "smtp.gmail.com",
  //port: 465,
  //secure: true,
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
    });console.log("✅ Email envoyé à :", to);
  } catch (error) {
    console.error("Erreur envoi email :", error);
  }
};


module.exports = { sendEmail };

