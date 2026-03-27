const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    // ✅ AGORA SIM pode validar
    if (req.user.tipo !== 'master') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};