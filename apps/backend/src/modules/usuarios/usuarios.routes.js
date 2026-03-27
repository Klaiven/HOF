const express = require('express');
const router = express.Router();
const controller = require('./usuarios.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, controller.getAll);
router.post('/', controller.create);

module.exports = router;