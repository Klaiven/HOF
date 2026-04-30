const prisma = require('../../config/prisma');
const bcrypt = require('bcrypt');

exports.getAll = async () => {
  // 🔥 Busca apenas os que estão ativos
  return await prisma.usuario.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' }
  });
};

exports.getById = async (id) => {
  return await prisma.usuario.findUnique({
    where: { id: Number(id) }
  });
};

exports.create = async (data) => {
  const senhaHash = await bcrypt.hash(data.senha, 10);
  
  if (data.dtNasc) {
    data.dtNasc = new Date(data.dtNasc);
  }

  return await prisma.usuario.create({
    data: {
      ...data,
      senha: senhaHash
    }
  });
};

exports.update = async (id, data) => {
  // Se a senha vier no corpo da requisição, faz o hash. Se não, remove para não apagar a antiga.
  if (data.senha) {
    data.senha = await bcrypt.hash(data.senha, 10);
  } else {
    delete data.senha; 
  }

  if (data.dtNasc) {
    data.dtNasc = new Date(data.dtNasc);
  }

  return await prisma.usuario.update({
    where: { id: Number(id) },
    data
  });
};

exports.desativar = async (id) => {
  // 🔥 Em vez de deletar, atualiza o ativo para false
  return await prisma.usuario.update({
    where: { id: Number(id) },
    data: { ativo: false }
  });
};