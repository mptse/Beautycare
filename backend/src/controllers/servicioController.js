const { Servicio } = require('../models');

// GET /api/servicios -> lista pública de servicios activos (para clientes)
async function listar(req, res) {
  const servicios = await Servicio.findAll({ where: { activo: true }, order: [['nombre', 'ASC']] });
  res.json(servicios);
}

// GET /api/servicios/todos -> lista completa, incluyendo inactivos (solo admin)
async function listarTodos(req, res) {
  const servicios = await Servicio.findAll({ order: [['nombre', 'ASC']] });
  res.json(servicios);
}

// POST /api/servicios (solo admin)
async function crear(req, res) {
  try {
    const { nombre, descripcion, precio, duracionMinutos } = req.body;
    if (!nombre || !precio || !duracionMinutos) {
      return res.status(400).json({ error: 'nombre, precio y duracionMinutos son obligatorios.' });
    }
    const servicio = await Servicio.create({ nombre, descripcion, precio, duracionMinutos });
    res.status(201).json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el servicio.' });
  }
}

// PUT /api/servicios/:id (solo admin)
async function actualizar(req, res) {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado.' });

    const { nombre, descripcion, precio, duracionMinutos, activo } = req.body;
    await servicio.update({ nombre, descripcion, precio, duracionMinutos, activo });
    res.json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el servicio.' });
  }
}

// DELETE /api/servicios/:id (solo admin)
async function eliminar(req, res) {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado.' });
    await servicio.destroy();
    res.json({ mensaje: 'Servicio eliminado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el servicio.' });
  }
}

module.exports = { listar, listarTodos, crear, actualizar, eliminar };
