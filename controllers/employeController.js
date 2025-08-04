const Employe = require("../models/Employe");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// Lire tous les employes
const getAllEmployes = async (req, res) => {
  try {
    const users = await Employe.findAll({ attributes: { exclude: ["password"] } });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const registerEmploye = async (req, res) => {
  try {
    const { name, email, password, role, salaire, leaveBalance } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Veuillez remplir tous les champs." });
    }

    const existingEmploye = await Employe.findOne({ where: { email } });
    if (existingEmploye) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    const newEmploye = await Employe.create({
      name,
      email,
      password,
      role,
      salaire,
      leaveBalance,
    });
    const token = generateToken(newEmploye);
    res.status(201).json({
      message: "Employe créé.",
      user: {
        id: newEmploye.id,
        name: newEmploye.name,
        email: newEmploye.email,
        role: newEmploye.role,
        salaire: newEmploye.salaire,
        leaveBalance: newEmploye.leaveBalance,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Lire un employe par id
const getEmployeById = async (req, res) => {
  try {
    const user = await Employe.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user)
      return res.status(404).json({ message: "Employe non trouvé." });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// Mettre à jour un employe
const updateEmploye = async (req, res) => {
  try {
    const { name, email, password, role , salaire, leaveBalance} = req.body;
    const user = await Employe.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Employe non trouvé." });
    
    const updatedFields = { name, email, role, salaire, leaveBalance };

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updatedFields.password = hashedPassword;
    }

    await user.update(updatedFields);
    res.status(200).json({ message: "Employe mis à jour.", user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// Supprimer un employe
const deleteEmploye = async (req, res) => {
  try {
    const employe = await Employe.findByPk(req.params.id);
    if (!employe)
      return res.status(404).json({ message: "Employe non trouvé." });

    await employe.destroy();
    res.status(200).json({ message: "Employe supprimé." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};
// Lire les infos de profil de l'utilisateur connecté
{/*const getProfile = async (req, res) => {
  try {
    console.log("req.user = ", req.user); 
    const { id, name, email, role } = req.user; // On extrait uniquement ce qui nous intéresse
    res.status(200).json({id, name, email, role });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};*/}

const getProfile = async (req, res) => {
  try {
    const user = await Employe.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};



module.exports = {
  getAllEmployes,
  registerEmploye,
  getEmployeById,
  updateEmploye,
  deleteEmploye,
  getProfile,
};
