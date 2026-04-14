const prisma = require('../../config/prisma');

exports.getAll = async () => {
  return await prisma.ramal.findMany({
    orderBy: { setor: 'asc' }
  });
};

exports.create = async (data) => {
  return await prisma.ramal.create({
    data
  });
};

exports.delete = async (id) => {
  return await prisma.ramal.delete({
    where: { id: Number(id) }
  });
};

// 🔥 NOVO UPDATE
exports.update = async (id, data) => {
  return await prisma.ramal.update({
    where: { id: Number(id) },
    data
  });
};