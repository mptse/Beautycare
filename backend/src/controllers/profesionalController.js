const { Profesional, Horario } = require('../models');

// GET /api/profesionales -> lista pública de profesionales activos
async function listar(req, res) {
  const profesionales = await Profesional.findAll({ where: { activo: true }, order: [['nombre', 'ASC']] });
  res.json(profesionales);
}

// GET /api/profesionales/todos (solo admin)
async function listarTodos(req, res) {
  const profesionales = await Profesional.findAll({ order: [['nombre', 'ASC']] });
  res.json(profesionales);
}

// POST /api/profesionales (solo admin)
async function crear(req, res) {
  try {
    const { nombre, especialidad } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio.' });
    const profesional = await Profesional.create({ nombre, especialidad });
    res.status(201).json(profesional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el profesional.' });
  }
}

// PUT /api/profesionales/:id (solo admin)
async function actualizar(req, res) {
  try {
    const profesional = await Profesional.findByPk(req.params.id);
    if (!profesional) return res.status(404).json({ error: 'Profesional no encontrado.' });

    const { nombre, especialidad, activo } = req.body;
    await profesional.update({ nombre, especialidad, activo });
    res.json(profesional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el profesional.' });
  }
}

// DELETE /api/profesionales/:id (solo admin)
async function eliminar(req, res) {
  try {
    const profesional = await Profesional.findByPk(req.params.id);
    if (!profesional) return res.status(404).json({ error: 'Profesional no encontrado.' });
    await profesional.destroy();
    res.json({ mensaje: 'Profesional eliminado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el profesional.' });
  }
}

// GET /api/profesionales/:id/horarios -> horarios semanales de un profesional
async function verHorarios(req, res) {
  const horarios = await Horario.findAll({
    where: { profesionalId: req.params.id },
    order: [['diaSemana', 'ASC']],
  });
  res.json(horarios);
}

module.exports = { listar, listarTodos, crear, actualizar, eliminar, verHorarios };
