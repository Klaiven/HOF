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