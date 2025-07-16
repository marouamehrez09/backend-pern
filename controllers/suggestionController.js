const Suggestion = require("../models/Suggestion");
const Employe = require("../models/Employe");

// Créer une suggestion
exports.createSuggestion = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description)
      return res
        .status(400)
        .json({ message: "Champs obligatoires manquants." });

    const suggestion = await Suggestion.create({
      employeId: req.user.id,
      title,
      description,
      status: "en attente",
    });

    res.status(201).json(suggestion);
  } catch (err) {
    console.error("Erreur création suggestion :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer suggestions selon rôle
exports.getSuggestions = async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role !== "admin") {
      whereClause.employeId = req.user.id;
    }

    const suggestions = await Suggestion.findAll({
      where: whereClause,
      include: { model: Employe, attributes: ["name", "email"] },
      order: [["created_at", "DESC"]],
    });

    res.json(suggestions);
  } catch (err) {
    console.error("Erreur récupération suggestions :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Mettre à jour le statut (admin)
exports.updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Accès refusé" });

    const { status, commentaire_rh } = req.body;

    const validStatuses = [
      "en attente",
      "rejetée",
      "validé et en cours de traitement",
      "traitée",
    ];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Statut invalide" });

    const suggestion = await Suggestion.findByPk(req.params.id);
    if (!suggestion)
      return res.status(404).json({ message: "Suggestion non trouvée" });

    suggestion.status = status;
    if (commentaire_rh !== undefined) {
      suggestion.commentaire_rh = commentaire_rh;
    }

    await suggestion.save();

    res.json(suggestion);
  } catch (err) {
    console.error("Erreur mise à jour statut suggestion :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Modifier une suggestion (employé)
exports.updateSuggestion = async (req, res) => {
    try {
      const { title, description } = req.body;
  
      const suggestion = await Suggestion.findByPk(req.params.id);
  
      if (!suggestion)
        return res.status(404).json({ message: "Suggestion non trouvée" });
  
      // Vérifie que l'auteur est bien l'employé connecté
      if (suggestion.employeId !== req.user.id)
        return res.status(403).json({ message: "Accès refusé" });
  
      // Empêcher la modification si statut ≠ "en attente"
      if (suggestion.status !== "en attente")
        return res.status(400).json({
          message: "Impossible de modifier une suggestion déjà traitée",
        });
  
      suggestion.title = title || suggestion.title;
      suggestion.description = description || suggestion.description;
      await suggestion.save();
  
      res.json(suggestion);
    } catch (err) {
      console.error("Erreur modification suggestion :", err);
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  };
  

  // Supprimer une suggestion (employé)
exports.deleteSuggestion = async (req, res) => {
    try {
      const suggestion = await Suggestion.findByPk(req.params.id);
  
      if (!suggestion)
        return res.status(404).json({ message: "Suggestion non trouvée" });
  
      if (suggestion.employeId !== req.user.id)
        return res.status(403).json({ message: "Accès refusé" });
  
      if (suggestion.status !== "en attente")
        return res.status(400).json({
          message: "Impossible de supprimer une suggestion déjà traitée",
        });
  
      await suggestion.destroy();
      res.json({ message: "Suggestion supprimée avec succès" });
    } catch (err) {
      console.error("Erreur suppression suggestion :", err);
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  };
  
