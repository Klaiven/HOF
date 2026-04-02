const express = require('express');
const router = express.Router();
const controller = require('./publicacoes.controller');

const upload = require('../../middlewares/upload');

router.get('/', controller.getPublicacoes);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

router.get('/:id', controller.getById);



router.post('/upload', upload.single('file'), (req, res) => {
  try {
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    res.json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: 'Erro no upload' });
  }
});

module.exports = router;

