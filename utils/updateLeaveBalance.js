const User = require("../models/Employe");

const updateLeaveBalances = async () => {
  try {
    const employes = await User.findAll({ where: { role: "employe" } });

    for (const emp of employes) {
      const nouveauSolde = emp.leaveBalance + 2;
      await emp.update({ leaveBalance: nouveauSolde });
    }

    console.log("Solde de congés mis à jour pour tous les employés.");
  } catch (err) {
    console.error("Erreur lors de la mise à jour du solde de congés :", err);
  }
};

module.exports = updateLeaveBalances;
