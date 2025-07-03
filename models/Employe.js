
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

const Employe = sequelize.define('Employe', {
  
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('employe','admin'),
    allowNull: false,
    defaultValue: "employe",
  },
  salaire: { 
    type: DataTypes.FLOAT 
  },
  leaveBalance: { 
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
});

module.exports = Employe;
