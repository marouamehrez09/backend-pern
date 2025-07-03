const jwt = require('jsonwebtoken');


const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 
      next();
    } catch (err) {
      return res.status(401).json({ message: "Token invalide." });
    }
  } else {
    return res.status(401).json({ message: "Non autorisé. Token manquant." });
  }
};

module.exports = protect;
