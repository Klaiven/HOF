const express = require('express');
const router = express.Router();
const controller = require('./publicacoes.controller');


const upload = require('../../middlewares/uploadPublicacoes');

router.get('/', controller.getPublicacoes);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

router.get('/:id', controller.getById);


router.post('/upload', upload.single('file'), (req, res) => {
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

