const jwt = require('jsonwebtoken');

// 1. Validação de Autenticação (Token)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou num formato inválido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // O payload deve conter { id, tipo, ... }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

// 2. Validação de Autorização (Perfis de Acesso)
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.tipo) {
      return res.status(403).json({ error: 'Acesso negado. Perfil de utilizador não encontrado.' });
    }

    // Normalização para minúsculas para evitar conflitos (ex: 'Master' vs 'master')
    const userRole = req.user.tipo.toLowerCase();
    const roles = allowedRoles.map(r => r.toLowerCase());

    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'O seu nível de acesso não permite efetuar esta ação.' });
    }

    next();
  };
};

module.exports = { authMiddleware, authorize };