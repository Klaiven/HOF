const service = require('./usuarios.service');

exports.getAll = async (req, res) => {
  const usuarios = await service.getAll();
  res.json(usuarios);
};

exports.create = async (req, res) => {
  const usuario = await service.create(req.body);
  res.json(usuario);
};