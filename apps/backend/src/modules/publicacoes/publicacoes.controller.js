const service = require('./publicacoes.service');

exports.getPublicacoes = async (req, res) => {
  try {
    const { tipo } = req.query;
    const data = await service.getByTipo(tipo);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar publicações' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await service.getById(id);

    if (!data) {
      return res.status(404).json({ error: 'Publicação não encontrada' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar publicação' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.create(req.body);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Erro ao criar' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔒 bloqueia alteração de campos sensíveis
    const { dtCriacao, usuarioId, ...resto } = req.body;

    const data = await service.update(id, resto);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
};

exports.remove = async (req, res) => {
  try {
    await service.delete(req.params.id);
    res.json({ message: 'Excluído' });
  } catch {
    res.status(500).json({ error: 'Erro ao excluir' });
  }
};