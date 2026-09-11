const express = require('express');
const router = express.Router();
const verificarAdmin = require('../middleware/auth');
const { limiteCitas } = require('../middleware/rateLimiter');
const ctrl = require('../controllers/citaController');

// Públicas (cliente)
router.get('/disponibilidad', ctrl.disponibilidad);
router.post('/', limiteCitas, ctrl.crear);
router.put('/:id/cancelar', ctrl.cancelar);

// Protegidas (admin)
router.get('/', verificarAdmin, ctrl.listar);
router.put('/:id/estado', verificarAdmin, ctrl.cambiarEstado);

module.exports = router;