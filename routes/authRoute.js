const express = require('express');
const router = express.Router();
const {loginEmploye, registerEmploye } = require('../controllers/authController');
const isAdmin = require("../middlewares/isAdmin");

//router.post('/register', isAdmin, registerEmploye);
router.post('/login', loginEmploye);

module.exports = router;
