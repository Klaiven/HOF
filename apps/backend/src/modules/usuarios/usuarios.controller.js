const service = require('./usuarios.service');

exports.getAll = async (req, res) => {
  try {
    const usuarios = await service.getAll();
    // Removemos a senha do retorno por segurança
    const seguros = usuarios.map(({ senha, ...resto }) => resto);
    res.json(seguros);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

exports.getById = async (req, res) => {
  try {
    const usuario = await service.getById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const { senha, ...seguro } = usuario;
    res.json(seguro);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

exports.create = async (req, res) => {
  try {
    const usuario = await service.create(req.body);
    const { senha, ...seguro } = usuario;
    res.json(seguro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

exports.update = async (req, res) => {
  try {
    const usuario = await service.update(req.params.id, req.body);
    const { senha, ...seguro } = usuario;
    res.json(seguro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

exports.desativar = async (req, res) => {
  try {
    await service.desativar(req.params.id);
    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desativar usuário' });
  }
};