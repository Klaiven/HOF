const service = require('./ramais.service');

exports.getAll = async (req, res) => {
  const data = await service.getAll();
  res.json(data);
};

exports.create = async (req, res) => {
  const ramal = await service.create(req.body);
  res.json(ramal);
};