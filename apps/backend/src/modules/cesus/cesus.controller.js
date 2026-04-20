const service = require('./cesus.service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar atendimentos CeSu.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Atendimento CeSu não encontrado.' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao procurar atendimento CeSu.' });
  }
};

exports.create = async (req, res) => {
  try {
    const novoAtendimento = await service.create(req.body);
    res.status(201).json(novoAtendimento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar atendimento CeSu.' });
  }
};

exports.update = async (req, res) => {
  try {
    const atualizado = await service.update(req.params.id, req.body);
    res.json(atualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar atendimento CeSu.' });
  }
};

exports.remove = async (req, res) => {
  try {
    await service.delete(req.params.id);
    res.json({ message: 'Atendimento CeSu excluído com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir atendimento CeSu.' });
  }
};
