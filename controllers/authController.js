const Employe = require("../models/Employe");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");


const loginEmploye = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email et mot de passe requis." });

  try {
    const employe = await Employe.findOne({ where: { email } });

    if (!employe)
      return res.status(404).json({ message: "Employe non trouvé." });

    const isMatch = await bcrypt.compare(password, employe.password);

    if (!isMatch)
      return res.status(401).json({ message: "Mot de passe incorrect." });

    const token = generateToken(employe);

    res.status(200).json({
      message: "Connexion réussie.",
      user: {
        id: employe.id,
        name: employe.name,
        email: employe.email,
        role: employe.role,
      },
      token,
    });
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = {
  loginEmploye,
};
