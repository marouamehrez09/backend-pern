const express = require("express");
const bcrypt = require("bcrypt");
const Employe = require("../models/Employe");

const router = express.Router();

// Route temporaire pour créer le premier admin
router.post("/", async (req, res) => {
  try {
    const { name, email, password, salaire, leaveBalance } = req.body;

    // Vérifie si un admin existe déjà
    const existingAdmin = await Employe.findOne({ where: { role: "admin" } });
    if (existingAdmin) {
      return res.status(400).json({ message: "Un admin existe déjà" });
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Création de l'admin
    const admin = await Employe.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      salaire,
      leaveBalance,
    });

    res.status(201).json({
      message: "Compte admin créé avec succès",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;
