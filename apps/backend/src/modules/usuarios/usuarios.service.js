const prisma = require('../../config/prisma');
const bcrypt = require('bcrypt');

exports.getAll = async () => {
  return await prisma.usuario.findMany();
};

exports.create = async (data) => {
  const senhaHash = await bcrypt.hash(data.senha, 10);

  return await prisma.usuario.create({
    data: {
      ...data,
      senha: senhaHash
    }
  });
};