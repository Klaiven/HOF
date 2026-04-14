const prisma = require('../../config/prisma');

exports.getAll = async () => {
  return prisma.link.findMany({
    orderBy: { pasta: 'asc' }
  });
};

exports.create = async (data) => {
  return prisma.link.create({
    data: {
      nome: data.nome,
      tipo: data.tipo,
      url: data.url,
      pasta: data.pasta,
      subpasta: data.subpasta,

      // 🔥 ESSENCIAL
      usuarioId: Number(data.usuarioId)
    }
  });
};

exports.delete = async (id) => {
  return prisma.link.delete({
    where: { id: Number(id) }
  });
};