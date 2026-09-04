const { Horario, Profesional } = require('../models');

// POST /api/horarios (solo admin) -> crear un bloque de disponibilidad
async function crear(req, res) {
  try {
    const { profesionalId, diaSemana, horaInicio, horaFin } = req.body;
    if (profesionalId === undefined || diaSemana === undefined || !horaInicio || !horaFin) {
      return res.status(400).json({ error: 'profesionalId, diaSemana, horaInicio y horaFin son obligatorios.' });
    }

    const profesional = await Profesional.findByPk(profesionalId);
    if (!profesional) return res.status(404).json({ error: 'Profesional no encontrado.' });

    const horario = await Horario.create({ profesionalId, diaSemana, horaInicio, horaFin });
    res.status(201).json(horario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el horario.' });
  }
}

// PUT /api/horarios/:id (solo admin)
async function actualizar(req, res) {
  try {
    const horario = await Horario.findByPk(req.params.id);
    if (!horario) return res.status(404).json({ error: 'Horario no encontrado.' });

    const { diaSemana, horaInicio, horaFin } = req.body;
    await horario.update({ diaSemana, horaInicio, horaFin });
    res.json(horario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el horario.' });
  }
}

// DELETE /api/horarios/:id (solo admin)
async function eliminar(req, res) {
  try {
    const horario = await Horario.findByPk(req.params.id);
    if (!horario) return res.status(404).json({ error: 'Horario no encontrado.' });
    await horario.destroy();
    res.json({ mensaje: 'Horario eliminado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el horario.' });
  }
}

module.exports = { crear, actualizar, eliminar };
