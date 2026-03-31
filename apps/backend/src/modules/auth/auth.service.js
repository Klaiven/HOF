const prisma = require('../../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (username, senha) => {
  const user = await prisma.usuario.findUnique({
    where: { username }
  });

  if (!user) throw new Error('Usuário não encontrado');

  const senhaValida = await bcrypt.compare(senha, user.senha);

  if (!senhaValida) throw new Error('Senha inválida');

  const token = jwt.sign(
    { id: user.id, tipo: user.tipo },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  const usuario = {
    id: user.id,
    username: user.username,
    nome: user.nome
  };

  return {
    token,
    usuario
  };
};