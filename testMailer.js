require('dotenv').config();
const { sendEmail } = require('./utils/mailer');

sendEmail('maroua.mehrez110989@gmail.com', 'Test Nodemailer', 'Ceci est un test.')
  .then(() => {
    console.log('Email envoyé avec succès !');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur envoi mail :', err);
    process.exit(1);
  });
