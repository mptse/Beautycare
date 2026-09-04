const express = require('express');
const router = express.Router();
const verificarAdmin = require('../middleware/auth');
const ctrl = require('../controllers/servicioController');

// Públicas (cliente)
router.get('/', ctrl.listar);

// Protegidas (admin)
router.get('/todos', verificarAdmin, ctrl.listarTodos);
router.post('/', verificarAdmin, ctrl.crear);
router.put('/:id', verificarAdmin, ctrl.actualizar);
router.delete('/:id', verificarAdmin, ctrl.eliminar);

module.exports = router;
