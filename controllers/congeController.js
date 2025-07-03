const Conge = require('../models/Conge');
const Employe = require('../models/Employe');
const congeRules = require("../utils/congeRules");
const {getJoursFeriesBetween } = require("../utils/joursFeries");
const { isBefore, isAfter } = require("date-fns"); 
const { Sequelize } = require("sequelize");


// Créer une demande de congé
exports.createConge = async (req, res) => {
  try {
    const { date_debut, date_fin, type, motif } = req.body;
    const rule = congeRules.rules[type];

    if (!rule) {
      return res.status(400).json({ message: "Type de congé invalide." });
    }

    const start = new Date(date_debut);
    const end = new Date(date_fin);
    const today = new Date();

    // 1. Vérifie que date début < date fin
    if (isAfter(start, end)) {
      return res.status(400).json({ message: "La date de début doit être avant la date de fin." });
    }

    // 2. Vérifie si le congé doit être immédiat (ex : maternité, paternité)
    if (rule.checkImmediate && isBefore(start, today)) {
      return res.status(400).json({ message: "Ce congé doit commencer aujourd'hui ou plus tard." });
    }

    // 3. Récupère les jours fériés entre start et end (multi-année possible)
    const joursFeries = getJoursFeriesBetween(start, end);

    // 4. Calcul des jours demandés en excluant weekends et jours fériés selon règles
    let totalJours = 0;
    let current = new Date(start);

    while (current <= end) {
      const dayStr = current.toISOString().split("T")[0];
      const isWeekend = [0, 6].includes(current.getDay());
      const isFerie = joursFeries.includes(dayStr);

      if (
        (!rule.exclureWeekends || !isWeekend) &&
        (!rule.exclureJoursFeries || !isFerie)
      ) {
        totalJours++;
      }

      current.setDate(current.getDate() + 1);
    }

    // 5. Vérifie le solde si nécessaire
    const employe = await Employe.findByPk(req.user.id);
    if (!employe) return res.status(404).json({ message: "Employé non trouvé." });

    if (rule.joursMax && totalJours > rule.joursMax) {
      return res.status(400).json({
        message: `Ce type de congé ne peut pas dépasser ${rule.joursMax} jours.`,
      });
    }

    if (rule.besoinSolde && totalJours > employe.leaveBalance) {
      return res.status(400).json({ message: "Solde de congé insuffisant." });
    }

    // 6. Création de la demande de congé
    const conge = await Conge.create({
      date_debut,
      date_fin,
      type,
      motif,
      statut: "en attente",
      employe_id: req.user.id,
    });

    // 7. Mise à jour du solde si le congé utilise du solde (et règle métier l'autorise)
    res.status(201).json({ message: "Demande envoyée", conge });
  } catch (err) {
    console.error("Erreur création congé :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer tous les congés (admin)
exports.getAllConges = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Non authentifié' });

    const role = req.user.role;
    const employeId = req.user.id;

    let whereClause = {};
    if (role !== 'admin') {
      whereClause = { employe_id: employeId };
    }

    const conges = await Conge.findAll({
      where: whereClause,
      include: { model: Employe, as: 'employe', attributes: ['name', 'email'] },
      order: [['createdAt', 'DESC']],
    });

    res.json(conges);
  } catch (err) {
    console.error("Erreur récupération congés :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


// Récupérer les congés d’un employé spécifique
exports.getCongesByEmploye = async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.id != req.params.id) {
        return res.status(403).json({ error: "Accès refusé" });
      }
  
      const conges = await Conge.findAll({
        where: { employe_id: req.params.id },
      });
  
      res.status(200).json(conges);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

// Mettre à jour le statut d’une demande de congé
exports.updateStatut = async (req, res) => {
  try {
    const { statut, commentaire_rh, date_traitement } = req.body;

    const statutsValid = ["en attente", "accepté", "refusé"];
    if (!statutsValid.includes(statut)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return res.status(404).json({ error: "Conge non trouvé" });

    const ancienStatut = conge.statut;

    //console.log("Ancien statut :", ancienStatut);
    //console.log("Nouveau statut :", statut);

    // Si c’est une première acceptation et que le type consomme du solde
    if (ancienStatut === "en attente" && statut === "accepté") {
      const rule = congeRules.rules[conge.type];
      //console.log("Type du congé :", conge.type);
      //console.log("Règle besoinSolde :", rule?.besoinSolde);

      if (rule && rule.besoinSolde) {
        const start = new Date(conge.date_debut);
        const end = new Date(conge.date_fin);
        const joursFeries = getJoursFeriesBetween(start, end);

        let totalJours = 0;
        let current = new Date(start);
        while (current <= end) {
          const dayStr = current.toISOString().split("T")[0];
          const isWeekend = [0, 6].includes(current.getDay());
          const isFerie = joursFeries.includes(dayStr);

          if (
            (!rule.exclureWeekends || !isWeekend) &&
            (!rule.exclureJoursFeries || !isFerie)
          ) {
            totalJours++;
          }

          current.setDate(current.getDate() + 1);
        }

        console.log("Jours à déduire :", totalJours);

        const employe = await Employe.findByPk(conge.employe_id);
        if (employe) {
          console.log("Solde AVANT :", employe.leaveBalance);

          employe.leaveBalance -= totalJours;
          if (employe.leaveBalance < 0) employe.leaveBalance = 0;

          await employe.save();

          //console.log("Solde APRÈS :", employe.leaveBalance);
        } else {
          //console.log("Employé introuvable");
        }
      }
    }

    // Après les vérifications, on met à jour et on sauvegarde le congé
    conge.statut = statut;
    conge.commentaire_rh = commentaire_rh || null;
    conge.date_traitement = date_traitement || new Date();

    await conge.save();

    res.status(200).json(conge);
  } catch (err) {
    console.error("Erreur updateStatut :", err);
    res.status(500).json({ error: err.message });
  }
};

// Supprimer une demande de congé 
exports.deleteConge = async (req, res) => {
  try {
    const deleted = await Conge.destroy({ where: { id: req.params.id } });
    if (deleted) return res.status(200).json({ message: "Demande de congé supprimée" });
    res.status(404).json({ error: "Conge non trouvé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Modifier une demande de congé 
exports.updateConge = async (req, res) => {
  try {
    const conge = await Conge.findByPk(req.params.id);
    if (!conge) return res.status(404).json({ error: "Demande non trouvée" });

    // Si ce n'est pas admin et que la demande n'est pas en attente => refus
    if (req.user.role !== "admin" && conge.statut !== "en attente") {
      return res.status(403).json({ error: "Modification interdite : demande déjà traitée" });
    }

    // Si ce n'est pas admin, vérifier que c'est bien son congé
    if (req.user.role !== "admin" && conge.employe_id !== req.user.id) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Mise à jour des champs modifiables
    const { date_debut, date_fin, type, motif } = req.body;
    conge.date_debut = date_debut || conge.date_debut;
    conge.date_fin = date_fin || conge.date_fin;
    conge.type = type || conge.type;
    conge.motif = motif || conge.motif;

    await conge.save();

    res.json(conge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Pour statistic
exports.getStats = async (req, res) => {
  try {
    console.log("Début getStats");

    // stats par type
    const statsParType = await Conge.findAll({
      attributes: [
        'type',
        [Sequelize.fn('COUNT', Sequelize.col('Conge.id')), 'count'],
      ],
      group: ['type'],
      raw: true,
    });
    console.log("statsParType:", statsParType);

    // stats par statut
    const statsParStatut = await Conge.findAll({
      attributes: [
        'statut',
        [Sequelize.fn('COUNT', Sequelize.col('Conge.id')), 'count'],
      ],
      group: ['statut'],
      raw: true,
    });
    console.log("statsParStatut:", statsParStatut);

    // Totaux
    let total = 0, enAttente = 0, accepte = 0, refuse = 0;

    statsParStatut.forEach((s) => {
      const count = parseInt(s.count, 10);
      total += count;
      switch (s.statut) {
        case 'en attente':
          enAttente = count;
          break;
        case 'accepté':
          accepte = count;
          break;
        case 'refusé':
          refuse = count;
          break;
      }
    });

    res.json({
      total,
      enAttente,
      accepte,
      refuse,
      parType: statsParType,
      parStatut: statsParStatut,
    });
  } catch (err) {
    console.error("Erreur getStats :", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


