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

    // Se a rota for administrativa (Site 2), permitimos master ou editor
    const tiposAutorizados = ['master', 'editor', 'ti']; 
    
    if (!tiposAutorizados.includes(req.user.tipo)) {
      return res.status(403).json({ error: 'Seu nível de acesso não permite esta ação.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};