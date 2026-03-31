const prisma = require('../../config/prisma');

exports.getByTipo = async (tipo) => {
  return await prisma.publicacao.findMany({
    where: { tipo },
    orderBy: { dtCriacao: 'desc' }
  });
};

exports.create = async (data) => {
  return prisma.publicacao.create({
    data
  });
};

exports.update = async (id, data) => {
  return prisma.publicacao.update({
    where: { id: Number(id) },
    data
  });
};

exports.delete = async (id) => {
  return prisma.publicacao.delete({
    where: { id: Number(id) }
  });
};