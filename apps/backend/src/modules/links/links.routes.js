const router = require('express').Router();
const controller = require('./links.controller');
const upload = require('../../middlewares/upload');

router.get('/', controller.get);
router.post('/', controller.create);
router.delete('/:id', controller.remove);

router.post('/upload', upload.single('file'), (req, res) => {
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