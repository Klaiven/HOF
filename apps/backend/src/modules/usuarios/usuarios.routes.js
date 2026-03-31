const express = require('express');
const router = express.Router();
const controller = require('./usuarios.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, controller.getAll);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.desativar); // Delete agora chama o desativar

module.exports = router;