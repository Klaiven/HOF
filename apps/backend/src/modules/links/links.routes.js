const router = require('express').Router();
const controller = require('./links.controller');
const upload = require('../../middlewares/upload');
const { authMiddleware, authorize } = require('../../middlewares/authMiddleware');

// Leitura: Todos os níveis autenticados
router.get('/', controller.get);

// Criação: Administrador e Master
router.post('/', authMiddleware, authorize(['administrador', 'master']), controller.create);

// Alteracao: Administrador e Master
router.put('/:id', authMiddleware, authorize(['administrador', 'master']), controller.update);

// Exclusão: Apenas Master
router.delete('/:id', authMiddleware, authorize(['master']), controller.remove);

// Upload: Administrador e Master (pois é uma ação de escrita/criação)
router.post('/upload', authMiddleware, authorize(['administrador', 'master']), upload.single('file'), (req, res) => {
  try {
    const filename = req.file.filename;
    const pastaDestino = req.body.pasta ? req.body.pasta.toLowerCase() : 'geral';
    
    res.json({
      url: `/uploadslinks/${pastaDestino}/${filename}`
    });

  } catch (err) {
    res.status(500).json({ error: 'Erro no upload' });
  }
});

module.exports = router;