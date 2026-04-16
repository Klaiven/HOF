// apps/backend/src/modules/setores/setores.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./setores.controller');
const { authMiddleware, authorize } = require('../../middlewares/authMiddleware');

// GET: Comum, Administrador e Master
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// POST/PUT: Administrador e Master
router.post('/', authMiddleware, authorize(['administrador', 'master']), controller.create);
router.put('/:id', authMiddleware, authorize(['administrador', 'master']), controller.update);

// DELETE: Apenas Master
router.delete('/:id', authMiddleware, authorize(['master']), controller.remove);

module.exports = router;