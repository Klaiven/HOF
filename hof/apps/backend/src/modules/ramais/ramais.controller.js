const service = require('./ramais.service');

exports.getAll = async (req, res) => {
  const data = await service.getAll();
  res.json(data);
};

exports.create = async (req, res) => {
  const ramal = await service.create(req.body);
  res.json(ramal);
};

// 🔥 DELETE PADRÃO
exports.remove = async (req, res) => {
  try {
    await service.delete(req.params.id);

    res.json({ message: 'Ramal excluído com sucesso' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir' });
  }
};

// 🔥 PUT (UPDATE)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const atualizado = await service.update(id, req.body);

    res.json(atualizado);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
};