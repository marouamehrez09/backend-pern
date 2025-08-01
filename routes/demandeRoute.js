const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

const {
  createDemande,
  getDemandes,
  updateStatus,
  updateDemande,
  deleteDemande,
} = require('../controllers/demandeController');

router.post('/', protect, createDemande);
router.get('/', protect, getDemandes);
router.put("/:id", protect, updateDemande);     
router.delete("/:id", protect, deleteDemande)

router.put('/status/:id', protect, isAdmin, updateStatus);

module.exports = router;
