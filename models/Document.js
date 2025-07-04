const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Employe = require('../models/Employe')

const Document = sequelize.define('Document', {
    employeeId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'Employes', 
            key: 'id',
            },
        },
    title: { 
        type: DataTypes.STRING 
    },
    type: { 
        type: DataTypes.ENUM("contrat" , "attestation presence" , "attestation travail", "certificat")
    },
    //filePath: { 
    //    type: DataTypes.STRING 
    //},
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,  
    },
}, { 
    timestamps: true ,
    tableName: 'Documents'
});

Document.belongsTo(Employe, {
    foreignKey: 'employeeId',
    as: 'employe',
});

module.exports = Document;
