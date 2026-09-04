const express = require('express');
const router = express.Router();
const verificarAdmin = require('../middleware/auth');
const ctrl = require('../controllers/horarioController');

router.post('/', verificarAdmin, ctrl.crear);
router.put('/:id', verificarAdmin, ctrl.actualizar);
router.delete('/:id', verificarAdmin, ctrl.eliminar);

module.exports = router;
