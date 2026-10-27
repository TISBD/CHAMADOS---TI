const { Roles } = require('../domain/enums');

/**
 * Middleware para exigir papel específico
 */
function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    if (req.user.role !== requiredRole && req.user.role !== Roles.ADMIN) {
      return res.status(403).json({
        success: false,
        error: `Acesso negado. Esta operação requer o perfil de [${requiredRole}].`
      });
    }

    next();
  };
}

/**
 * Middleware para permitir qualquer um dos papéis listados
 */
function requireAnyRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== Roles.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado para o seu perfil de usuário.'
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireAnyRole
};
