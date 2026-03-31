const express = require('express');
const router = express.Router();
const controller = require('./publicacoes.controller');

router.get('/', controller.getPublicacoes);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;