const express = require('express');
const router = express.Router();
const controller = require('./publicacoes.controller');
const upload = require('../../middlewares/uploadPublicacoes');
const { authMiddleware, authorize } = require('../../middlewares/authMiddleware');

// Leitura: Todos os níveis autenticados
router.get('/', authMiddleware, authorize(['comum', 'administrador', 'master']), controller.getPublicacoes);
router.get('/:id', authMiddleware, authorize(['comum', 'administrador', 'master']), controller.getById);

// Criação e Edição: Administrador e Master
router.post('/', authMiddleware, authorize(['administrador', 'master']), controller.create);
router.put('/:id', authMiddleware, authorize(['administrador', 'master']), controller.update);

// Exclusão: Apenas Master
router.delete('/:id', authMiddleware, authorize(['master']), controller.remove);

// Upload: Administrador e Master (pois é uma ação de escrita/criação)
router.post('/upload', authMiddleware, authorize(['administrador', 'master']), upload.single('file'), (req, res) => {
  try {
    const filePath = req.file.path.replace(/\\/g, '/');

    res.json({
      url: `api/${filePath}`
    });

  } catch (err) {
    res.status(500).json({ error: 'Erro no upload' });
  }
});

module.exports = router;