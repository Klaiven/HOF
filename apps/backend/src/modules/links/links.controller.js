const service = require('./links.service');

exports.get = async (req, res) => {
  const data = await service.getAll();
  res.json(data);
};

exports.create = async (req, res) => {
  const data = await service.create(req.body);
  res.json(data);
};

exports.remove = async (req, res) => {
  await service.delete(req.params.id);
  res.json({ ok: true });
};

exports.update = async (req, res) => {
    await service.update(id, resto);
    res.json({ ok: true });
};