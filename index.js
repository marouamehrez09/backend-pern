const express = require('express');
const sequelize = require('./config/db'); 
const authRoute = require('./routes/authRoute.js');
const employeRoute = require('./routes/employeRoute');
const congeRoute = require('./routes/congeRoute');
const documentRoute = require('./routes/documentRoute.js');
const suggestionRoute = require('./routes/suggestionRoute.js');
const demandeRoute = require('./routes/demandeRoute.js');
require('dotenv').config();
const morgan = require('morgan');
const cron = require('node-cron');
const updateLeaveBalances = require('./utils/updateLeaveBalance');
const path = require('path');
const cors = require("cors");
const setupAdminRoute = require("./routes/setupAdmin");

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Servir les fichiers PDF et autres fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Synchroniser les modèles Sequelize avec la base de données
sequelize.sync()
    .then(() => console.log('Base de données synchronisée avec Sequelize'))
    .catch(err => console.error('Erreur lors de la synchronisation :', err));

// Les routes
app.use('/api/auth', authRoute);
app.use('/api/user', employeRoute);
app.use('/api/conge', congeRoute)
app.use('/api/document', documentRoute);
app.use('/api/suggestion', suggestionRoute);
app.use('/api/demande', demandeRoute);
app.use("/api/setup-admin", setupAdminRoute);

// Planifier le cron pour chaque 1er jour du mois à minuit
cron.schedule('0 0 1 * *', () => {
    console.log("Cron lancé pour mise à jour du leaveBalance...");
    updateLeaveBalances();
});

// Démarrer le serveur
const PORT = process.env.PORT ;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});