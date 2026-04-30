const express = require('express');
const router = express.Router();
const controller = require('./indicadores.controller');
const { authMiddleware } = require('../../middlewares/authMiddleware');

router.get('/tempo-laudo', authMiddleware, controller.getTempoLaudo);
router.get('/exames-imagem', authMiddleware, controller.getExamesImagem);
router.get('/painel-laudos', authMiddleware, controller.getPainelLaudos);

module.exports = router;