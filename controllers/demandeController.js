const Demande = require("../models/Demande");
const Employe = require("../models/Employe");
const { sendEmail } = require("../utils/mailer");

// Créer une demande
{/*exports.createDemande = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description)
      return res
        .status(400)
        .json({ message: "Champs obligatoires manquants." });

    const demande = await Demande.create({
      employeId: req.user.id,
      title,
      description,
      status: "en attente",
    });

    res.status(201).json(demande);
  } catch (err) {
    console.error("Erreur création demande :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};*/}
exports.createDemande = async (req, res) => {
  try {
    const { title, description } = req.body;

    const demande = await Demande.create({
      employeId: req.user.id,
      title,
      description,
      status: "en attente",
    });

    const admins = await Employe.findAll({
      where: { role: "admin" },
      attributes: ["email"]
    });
    const adminEmails = admins.map(admin => admin.email);

    await sendEmail(
      adminEmails.join(","),
      "📥 Nouvelle demande reçue",
      `Bonjour,

Une nouvelle demande a été envoyée par ${req.user.name}.

📌 Title : ${title}
📝 Description : ${description}

Connectez-vous pour la traiter.

Cordialement,
Système de gestion`
    );

    res.status(201).json({ message: "Demande créée avec succès", demande });
  } catch (err) {
    console.error("Erreur création demande :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


// Récupérer demande selon rôle
exports.getDemandes = async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role !== "admin") {
      whereClause.employeId = req.user.id;
    }

    const demandes = await Demande.findAll({
      where: whereClause,
      include: { model: Employe, attributes: ["name", "email"] },
      order: [["created_at", "DESC"]],
    });

    res.json(demandes);
  } catch (err) {
    console.error("Erreur récupération demandes :", err);
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

    const demande = await Demande.findByPk(req.params.id);
    if (!demande)
      return res.status(404).json({ message: "Demande non trouvée" });

    demande.status = status;
    if (commentaire_rh !== undefined) {
      demande.commentaire_rh = commentaire_rh;
    }

    await demande.save();
    // ✅ Récupérer l'employé concerné pour l'email
    const employe = await Employe.findByPk(demande.employeId);
    if (employe) {
      await sendEmail(
        employe.email,
        "📢 Mise à jour de votre demande",
        `Bonjour ${employe.name},

Votre demande "${demande.title}" a été mise à jour.

📌 Nouveau statut : ${status}
${commentaire_rh ? `💬 Commentaire RH : ${commentaire_rh}` : ""}

Merci,
Système de gestion`
      );
    }


    res.json(demande);
  } catch (err) {
    console.error("Erreur mise à jour statut demande :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Modifier une demande (employé)
exports.updateDemande = async (req, res) => {
    try {
      const { title, description } = req.body;
  
      const demande = await Demande.findByPk(req.params.id);
  
      if (!demande)
        return res.status(404).json({ message: "Demande non trouvée" });
  
      // Vérifie que l'auteur est bien l'employé connecté
      if (demande.employeId !== req.user.id)
        return res.status(403).json({ message: "Accès refusé" });
  
      // Empêcher la modification si statut ≠ "en attente"
      if (demande.status !== "en attente")
        return res.status(400).json({
          message: "Impossible de modifier une demande déjà traitée",
        });
  
      demande.title = title || demande.title;
      demande.description = description || demande.description;
      await demande.save();
  
      res.json(demande);
    } catch (err) {
      console.error("Erreur modification demande :", err);
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  };
  

  // Supprimer une demande (employé)
exports.deleteDemande = async (req, res) => {
    try {
      const demande = await Demande.findByPk(req.params.id);
  
      if (!demande)
        return res.status(404).json({ message: "Demande non trouvée" });
  
      if (demande.employeId !== req.user.id)
        return res.status(403).json({ message: "Accès refusé" });
  
      if (demande.status !== "en attente")
        return res.status(400).json({
          message: "Impossible de supprimer une demande déjà traitée",
        });
  
      await demande.destroy();
      res.json({ message: "Demande supprimée avec succès" });
    } catch (err) {
      console.error("Erreur suppression demande :", err);
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  };
  
