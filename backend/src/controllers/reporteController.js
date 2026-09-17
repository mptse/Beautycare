const { Op } = require('sequelize');
const { Cita, Servicio, Profesional } = require('../models');

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * GET /api/reportes/ingresos?anio=2026
 * Devuelve el total ganado y la cantidad de citas completadas, mes por mes, para un año.
 * Solo cuenta citas con estado "completada" (el servicio ya se prestó y se cobró).
 */
async function ingresosPorAnio(req, res) {
  try {
    const anio = parseInt(req.query.anio) || new Date().getFullYear();

    const citas = await Cita.findAll({
      where: {
        estado: 'completada',
        fecha: { [Op.between]: [`${anio}-01-01`, `${anio}-12-31`] },
      },
      include: [{ model: Servicio }],
    });

    // Inicializamos los 12 meses en cero para que el reporte siempre muestre el año completo
    const meses = NOMBRES_MESES.map((nombre, i) => ({
      mes: i + 1,
      nombre,
      totalIngresos: 0,
      cantidadCitas: 0,
    }));

    for (const cita of citas) {
      const mesIndex = parseInt(cita.fecha.split('-')[1], 10) - 1; // "2026-09-07" -> mes 9 -> índice 8
      meses[mesIndex].totalIngresos += cita.Servicio ? cita.Servicio.precio : 0;
      meses[mesIndex].cantidadCitas += 1;
    }

    const totalAnual = meses.reduce((suma, m) => suma + m.totalIngresos, 0);
    const totalCitas = meses.reduce((suma, m) => suma + m.cantidadCitas, 0);

    res.json({ anio, meses, totalAnual, totalCitas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al calcular el reporte de ingresos.' });
  }
}

/**
 * GET /api/reportes/ingresos-mes?anio=2026&mes=9
 * Desglose de un mes específico: ingresos por servicio y por profesional.
 */
async function ingresosPorMes(req, res) {
  try {
    const anio = parseInt(req.query.anio) || new Date().getFullYear();
    const mes = parseInt(req.query.mes);
    if (!mes || mes < 1 || mes > 12) {
      return res.status(400).json({ error: 'Debes indicar un mes válido (1-12).' });
    }

    const mesTexto = String(mes).padStart(2, '0');
    const ultimoDia = new Date(anio, mes, 0).getDate(); // último día real de ese mes

    const citas = await Cita.findAll({
      where: {
        estado: 'completada',
        fecha: { [Op.between]: [`${anio}-${mesTexto}-01`, `${anio}-${mesTexto}-${ultimoDia}`] },
      },
      include: [{ model: Servicio }, { model: Profesional }],
    });

    const porServicio = {};
    const porProfesional = {};
    let totalIngresos = 0;

    for (const cita of citas) {
      const precio = cita.Servicio ? cita.Servicio.precio : 0;
      totalIngresos += precio;

      const nombreServicio = cita.Servicio ? cita.Servicio.nombre : 'Servicio eliminado';
      if (!porServicio[nombreServicio]) porServicio[nombreServicio] = { nombre: nombreServicio, cantidad: 0, total: 0 };
      porServicio[nombreServicio].cantidad += 1;
      porServicio[nombreServicio].total += precio;

      const nombreProfesional = cita.Profesional ? cita.Profesional.nombre : 'Profesional eliminado';
      if (!porProfesional[nombreProfesional]) porProfesional[nombreProfesional] = { nombre: nombreProfesional, cantidad: 0, total: 0 };
      porProfesional[nombreProfesional].cantidad += 1;
      porProfesional[nombreProfesional].total += precio;
    }

    res.json({
      anio,
      mes,
      nombreMes: NOMBRES_MESES[mes - 1],
      totalIngresos,
      cantidadCitas: citas.length,
      porServicio: Object.values(porServicio).sort((a, b) => b.total - a.total),
      porProfesional: Object.values(porProfesional).sort((a, b) => b.total - a.total),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al calcular el desglose del mes.' });
  }
}

module.exports = { ingresosPorAnio, ingresosPorMes };