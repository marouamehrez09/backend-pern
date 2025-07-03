const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Employe = require('./Employe');

const Conge = sequelize.define("Conge", {
        employe_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Employes', 
                key: 'id',
            },
        },
        date_debut: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        date_fin: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM(
                "annuel",
                "maladie",
                "maternité",
                "paternité",
                "événements familiaux",
                "sans solde",
                "formation professionnelle",
                "convenance personnelle",
                "exceptionnel"
        ),
            allowNull: false,
        },
        motif: {
            type: DataTypes.TEXT,
        },
        statut: {
            type: DataTypes.ENUM("en attente", "accepté", "refusé"),
            defaultValue: "en attente",
        },
        commentaire_rh: {
            type: DataTypes.TEXT,
        },
        date_soumission: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        date_traitement: {
            type: DataTypes.DATE,
        },
    });

    Conge.belongsTo(Employe, {
        foreignKey: 'employe_id',
        as: 'employe',
    });


module.exports = Conge;