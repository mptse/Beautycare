const express = require('express');
const router = express.Router();
const verificarAdmin = require('../middleware/auth');
const ctrl = require('../controllers/citaController');

// Públicas (cliente)
router.get('/disponibilidad', ctrl.disponibilidad);
router.post('/', ctrl.crear);
router.put('/:id/cancelar', ctrl.cancelar);

// Protegidas (admin)
router.get('/', verificarAdmin, ctrl.listar);
router.put('/:id/estado', verificarAdmin, ctrl.cambiarEstado);

module.exports = router;
