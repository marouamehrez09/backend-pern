const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Employe = require('./Employe');

const Demande = sequelize.define('Demande', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('en attente', 'validé et en cours de traitement', 'traitée' , 'rejetée'),
    defaultValue: 'en attente',
  },
  commentaire_rh: {
    type: DataTypes.TEXT,
},
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Association : une demande appartient à un employé
Demande.belongsTo(Employe, { foreignKey: 'employeId', onDelete: 'CASCADE' });
Employe.hasMany(Demande, { foreignKey: 'employeId' });

module.exports = Demande;
