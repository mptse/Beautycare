const express = require('express');
const router = express.Router();
const verificarAdmin = require('../middleware/auth');
const ctrl = require('../controllers/reporteController');

router.get('/ingresos', verificarAdmin, ctrl.ingresosPorAnio);
router.get('/ingresos-mes', verificarAdmin, ctrl.ingresosPorMes);

module.exports = router;