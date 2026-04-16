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

exports.update = async (id, data) => {
  const { id: idDoBody, dtCriacao, ...dadosAtualizados } = data;

  if (dadosAtualizados.usuarioId) {
    dadosAtualizados.usuarioId = Number(dadosAtualizados.usuarioId);
  }

  return prisma.link.update({
    where: { id: Number(id) },
    data: dadosAtualizados
  });
};
