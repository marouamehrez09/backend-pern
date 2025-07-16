const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

const {
  createSuggestion,
  getSuggestions,
  updateStatus,
  updateSuggestion,
  deleteSuggestion,
} = require('../controllers/suggestionController');

router.post('/', protect, createSuggestion);
router.get('/', protect, getSuggestions);
router.put("/:id", protect, updateSuggestion);     
router.delete("/:id", protect, deleteSuggestion)

router.put('/status/:id', protect, isAdmin, updateStatus);

module.exports = router;
