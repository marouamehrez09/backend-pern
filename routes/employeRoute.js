const express = require("express");
const router = express.Router();
const {
  getAllEmployes,
  registerEmploye,
  getEmployeById,
  updateEmploye,
  deleteEmploye,
  getProfile,
} = require("../controllers/employeController");
const protect = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");

router.get("/profile", protect, getProfile);
router.get("/", protect, getAllEmployes);
router.post("/register", registerEmploye);
router.get("/:id", protect, isAdmin, getEmployeById);
router.put("/:id", protect, isAdmin, updateEmploye);
router.delete("/:id", protect, isAdmin, deleteEmploye);

module.exports = router;
