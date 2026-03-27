const express = require('express');
const router = express.Router();
const controller = require('./indicadores.controller');
const auth = require('../../middlewares/authMiddleware');

router.get('/tempo-laudo', auth, controller.getTempoLaudo);

module.exports = router;