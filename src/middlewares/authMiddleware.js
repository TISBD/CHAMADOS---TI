const jwt = require('jsonwebtoken');
const appConfig = require('../config/appConfig');
const userRepository = require('../repositories/userRepository');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação não fornecido ou formato inválido.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, appConfig.jwt.secret);
    const user = userRepository.findById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Sessão inválida ou usuário desativado.'
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_id,
      department_id: user.department_id
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Sua sessão expirou. Por favor, realize login novamente.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Token inválido.'
    });
  }
}

module.exports = authMiddleware;
