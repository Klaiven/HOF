const express = require('express');
const router = express.Router();

const usuariosRoutes = require('../modules/usuarios/usuarios.routes');
router.use('/usuarios', usuariosRoutes);

const authRoutes = require('../modules/auth/auth.routes');
router.use('/auth', authRoutes);

// const ramaisRoutes = require('../modules/ramais/ramais.routes');
// router.use('/ramais', ramaisRoutes);

const setoresRoutes = require('../modules/setores/setores.routes');
router.use('/setores', setoresRoutes);

// const indicadoresRoutes = require('../modules/indicadores/indicadores.routes');
// router.use('/indicadores', indicadoresRoutes);

const publicacoesRoutes = require('../modules/publicacoes/publicacoes.routes');
router.use('/publicacoes', publicacoesRoutes);

module.exports = router;