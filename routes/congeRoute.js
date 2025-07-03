const express = require('express');
const router = express.Router();

const {
  createConge,
  getAllConges,
  getCongesByEmploye,
  updateStatut,
  deleteConge,
  updateConge,
  getStats,
} = require('../controllers/congeController');

const protect = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// Route pour créer une demande de congé (accessible à tous les employés connectés)
router.post('/', protect, createConge);

// Récupérer tous les congés (admin uniquement)
router.get('/', protect, getAllConges);

// statistic
router.get('/stats', protect, isAdmin, getStats);

// Récupérer les congés d’un employé (lui-même ou admin)
router.get('/:id', protect, getCongesByEmploye);

// Mettre à jour le statut d’un congé (admin uniquement)
router.put('/statut/:id', protect, isAdmin, updateStatut);

// Supprimer une demande de congé (admin uniquement ou à adapter selon besoin)
router.delete('/:id', protect, deleteConge);

// Modifier une demande de congé 
router.put('/:id', protect, updateConge);


module.exports = router;
