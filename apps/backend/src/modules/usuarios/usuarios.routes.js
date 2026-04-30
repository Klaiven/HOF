const express = require('express');
const router = express.Router();
const controller = require('./usuarios.controller');

// 1. IMPORTAÇÃO CORRIGIDA (usando desestruturação)
const { authMiddleware, authorize } = require('../../middlewares/authMiddleware');

/**
 * PADRÃO DE ACESSO PARA USUÁRIOS:
 * Como a gestão de usuários é uma área sensível:
 * - GET: Administrador e Master
 * - POST / PUT / DELETE: Apenas Master
 */

// Leitura
router.get('/', authMiddleware, authorize(['administrador', 'master']), controller.getAll);
router.get('/:id', authMiddleware, authorize(['administrador', 'master']), controller.getById);

// Escrita (Apenas Master)
router.post('/', authMiddleware, authorize(['administrador','master']), controller.create);
router.put('/:id', authMiddleware, authorize(['administrador','master']), controller.update);
router.delete('/:id', authMiddleware, authorize(['master']), controller.desativar);

module.exports = router;