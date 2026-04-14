// apps/backend/src/modules/setores/setores.controller.js
const service = require('./setores.service');

exports.getAll = async (req, res) => {
  try {
    // Recebe os filtros enviados pelo frontend através de query params
    const filtros = {
      nome: req.query.nome,
      subsetor: req.query.subsetor,
      ramal: req.query.ramal
    };
    
    const data = await service.getAll(filtros);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar setores.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Setor não encontrado.' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao procurar o setor.' });
  }
};

exports.create = async (req, res) => {
  try {
    const novoSetor = await service.create(req.body);
    res.status(201).json(novoSetor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar setor.' });
  }
};

exports.update = async (req, res) => {
  try {
    const atualizado = await service.update(req.params.id, req.body);
    res.json(atualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar setor.' });
  }
};

exports.remove = async (req, res) => {
  try {
    await service.delete(req.params.id);
    res.json({ message: 'Setor excluído com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir setor.' });
  }
};