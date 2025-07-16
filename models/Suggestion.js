const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Employe = require('./Employe');

const Suggestion = sequelize.define('Suggestion', {
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

// Association : une suggestion appartient à un employé
Suggestion.belongsTo(Employe, { foreignKey: 'employeId', onDelete: 'CASCADE' });
Employe.hasMany(Suggestion, { foreignKey: 'employeId' });

module.exports = Suggestion;
