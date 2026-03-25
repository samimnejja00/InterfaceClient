const jwt = require('jsonwebtoken');

/**
 * Middleware qui vérifie le JWT du client et injecte req.client
 * Séparé du système d'auth des users internes (@comar.tn)
 */
const authenticateClient = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé. Veuillez vous connecter.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.client = {
      id: decoded.client_id,
      email: decoded.email,
      nom_complet: decoded.nom_complet
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Votre session a expiré. Veuillez vous reconnecter.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token invalide. Veuillez vous reconnecter.'
    });
  }
};

module.exports = authenticateClient;
