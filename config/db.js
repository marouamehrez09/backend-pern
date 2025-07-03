const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,     
  process.env.DB_USER,      
  process.env.DB_PASSWORD,  
    {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, 
    }
);

// Tester la connexion
//sequelize.authenticate()
//  .then(() => console.log('Connecté à PostgreSQL avec Sequelize'))
//  .catch((err) => console.error('Erreur de connexion Sequelize :', err));

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
connection();

module.exports = sequelize;
