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
    try {
        const { id } = req.params;
        const resto = req.body;
        
        await service.update(id, resto);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o link' });
    }
};