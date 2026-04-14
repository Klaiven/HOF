// apps/backend/src/modules/setores/setores.service.js
const prisma = require('../../config/prisma');

exports.getAll = async (filtros) => {
  const { nome, subsetor, ramal } = filtros;
  
  return await prisma.setores.findMany({
    where: {
      nome: nome ? { contains: nome, mode: 'insensitive' } : undefined,
      subsetor: subsetor ? { contains: subsetor, mode: 'insensitive' } : undefined,
      ramal: ramal ? { contains: ramal, mode: 'insensitive' } : undefined,
    },
    orderBy: { nome: 'asc' }
  });
};

exports.getById = async (id) => {
  return await prisma.setores.findUnique({ where: { id: Number(id) } });
};

exports.create = async (data) => {
  return await prisma.setores.create({ data });
};

exports.update = async (id, data) => {
  return await prisma.setores.update({
    where: { id: Number(id) },
    data
  });
};

exports.delete = async (id) => {
  return await prisma.setores.delete({
    where: { id: Number(id) }
  });
};