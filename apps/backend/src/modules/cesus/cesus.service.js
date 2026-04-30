const prisma = require('../../config/prisma');

exports.getAll = async () => {
  return await prisma.usuarioCeSu.findMany({
    include: {
      usuarioAtendimento: {
        select: {
          id: true,
          nome: true,
          username: true
        }
      }
    },
    orderBy: { horarioAbertura: 'desc' }
  });
};

exports.getById = async (id) => {
  return await prisma.usuarioCeSu.findUnique({
    where: { id: Number(id) },
    include: {
      usuarioAtendimento: {
        select: {
          id: true,
          nome: true,
          username: true
        }
      }
    }
  });
};

exports.create = async (data) => {
  return await prisma.usuarioCeSu.create({
    data: {
      nomeCompleto: data.nomeCompleto,
      ramalTelefone: data.ramalTelefone,
      email: data.email,
      setor: data.setor,
      descricao: data.descricao,
      usuarioAtendimentoId: data.usuarioAtendimentoId ? Number(data.usuarioAtendimentoId) : null,
      horarioAtendimento: data.horarioAtendimento ? new Date(data.horarioAtendimento) : null,
      resolvido: data.resolvido !== undefined ? data.resolvido : null,
      CdChamadoCesu: data.CdChamadoCesu || null
    }
  });
};

exports.update = async (id, data) => {
  return await prisma.usuarioCeSu.update({
    where: { id: Number(id) },
    data: {
      nomeCompleto: data.nomeCompleto,
      ramalTelefone: data.ramalTelefone,
      email: data.email,
      setor: data.setor,
      descricao: data.descricao,
      resolvido: data.resolvido !== undefined ? data.resolvido : undefined,
      CdChamadoCesu: data.CdChamadoCesu !== undefined ? data.CdChamadoCesu : undefined,
      usuarioAtendimentoId: data.usuarioAtendimentoId !== undefined ? (data.usuarioAtendimentoId ? Number(data.usuarioAtendimentoId) : null) : undefined,
      horarioAtendimento: data.horarioAtendimento !== undefined ? (data.horarioAtendimento ? new Date(data.horarioAtendimento) : null) : undefined,
    }
  });
};

exports.delete = async (id) => {
  return await prisma.usuarioCeSu.delete({
    where: { id: Number(id) }
  });
};
