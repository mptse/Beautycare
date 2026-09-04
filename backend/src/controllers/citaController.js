const { Op } = require('sequelize');
const { Cita, Cliente, Profesional, Servicio, Horario } = require('../models');

// --- Utilidades para trabajar con horas en formato "HH:mm" ---
function horaAMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}
function minutosAHora(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * GET /api/citas/disponibilidad?profesionalId=1&servicioId=2&fecha=2026-09-10
 * Calcula los bloques de horario disponibles para un profesional en una fecha,
 * teniendo en cuenta su horario de trabajo y las citas ya reservadas.
 */
async function disponibilidad(req, res) {
  try {
    const { profesionalId, servicioId, fecha } = req.query;
    if (!profesionalId || !servicioId || !fecha) {
      return res.status(400).json({ error: 'profesionalId, servicioId y fecha son obligatorios.' });
    }

    const servicio = await Servicio.findByPk(servicioId);
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado.' });

    const diaSemana = new Date(fecha + 'T00:00:00').getDay(); // 0=Domingo ... 6=Sábado

    const horarios = await Horario.findAll({ where: { profesionalId, diaSemana } });
    if (horarios.length === 0) {
      return res.json([]); // el profesional no trabaja ese día
    }

    // Citas ya existentes de ese profesional en esa fecha (no canceladas)
    const citasExistentes = await Cita.findAll({
      where: { profesionalId, fecha, estado: { [Op.ne]: 'cancelada' } },
      include: [{ model: Servicio }],
    });

    const bloquesOcupados = citasExistentes.map((cita) => {
      const inicio = horaAMinutos(cita.hora);
      const duracion = cita.Servicio ? cita.Servicio.duracionMinutos : servicio.duracionMinutos;
      return { inicio, fin: inicio + duracion };
    });

    const duracionServicio = servicio.duracionMinutos;
    const slotsDisponibles = [];

    for (const bloqueTrabajo of horarios) {
      let cursor = horaAMinutos(bloqueTrabajo.horaInicio);
      const fin = horaAMinutos(bloqueTrabajo.horaFin);

      while (cursor + duracionServicio <= fin) {
        const finPropuesto = cursor + duracionServicio;
        const seCruza = bloquesOcupados.some(
          (b) => cursor < b.fin && finPropuesto > b.inicio
        );
        if (!seCruza) {
          slotsDisponibles.push(minutosAHora(cursor));
        }
        cursor += duracionServicio; // avanzamos de a un turno completo
      }
    }

    res.json(slotsDisponibles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al calcular la disponibilidad.' });
  }
}

/**
 * POST /api/citas
 * body: { nombre, telefono, email, profesionalId, servicioId, fecha, hora }
 * Crea el cliente si no existe (por teléfono) y agenda la cita, validando que el horario siga libre.
 */
async function crear(req, res) {
  try {
    const { nombre, telefono, email, profesionalId, servicioId, fecha, hora } = req.body;

    if (!nombre || !telefono || !profesionalId || !servicioId || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan datos obligatorios para agendar la cita.' });
    }

    const servicio = await Servicio.findByPk(servicioId);
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado.' });

    const profesional = await Profesional.findByPk(profesionalId);
    if (!profesional) return res.status(404).json({ error: 'Profesional no encontrado.' });

    // Revalidar que el horario siga disponible (evita reservas duplicadas por condiciones de carrera)
    const inicioNueva = horaAMinutos(hora);
    const finNueva = inicioNueva + servicio.duracionMinutos;

    const citasExistentes = await Cita.findAll({
      where: { profesionalId, fecha, estado: { [Op.ne]: 'cancelada' } },
      include: [{ model: Servicio }],
    });

    const hayConflicto = citasExistentes.some((cita) => {
      const inicio = horaAMinutos(cita.hora);
      const duracion = cita.Servicio ? cita.Servicio.duracionMinutos : servicio.duracionMinutos;
      const fin = inicio + duracion;
      return inicioNueva < fin && finNueva > inicio;
    });

    if (hayConflicto) {
      return res.status(409).json({ error: 'Ese horario ya no está disponible, elige otro.' });
    }

    // Buscamos o creamos el cliente por teléfono
    let cliente = await Cliente.findOne({ where: { telefono } });
    if (!cliente) {
      cliente = await Cliente.create({ nombre, telefono, email });
    }

    const cita = await Cita.create({
      clienteId: cliente.id,
      profesionalId,
      servicioId,
      fecha,
      hora,
      estado: 'pendiente',
    });

    const citaCompleta = await Cita.findByPk(cita.id, {
      include: [Cliente, Profesional, Servicio],
    });

    res.status(201).json(citaCompleta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la cita.' });
  }
}

/**
 * PUT /api/citas/:id/cancelar
 * body: { telefono } -> se pide el teléfono para confirmar que es el dueño de la cita
 */
async function cancelar(req, res) {
  try {
    const cita = await Cita.findByPk(req.params.id, { include: [Cliente] });
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada.' });

    const { telefono } = req.body;
    if (!telefono || cita.Cliente.telefono !== telefono) {
      return res.status(403).json({ error: 'El teléfono no coincide con el de la reserva.' });
    }

    await cita.update({ estado: 'cancelada' });
    res.json({ mensaje: 'Cita cancelada correctamente.', cita });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cancelar la cita.' });
  }
}

/**
 * GET /api/citas (solo admin) -> lista todas las citas, con filtros opcionales
 * query params opcionales: fecha, profesionalId, estado
 */
async function listar(req, res) {
  const { fecha, profesionalId, estado } = req.query;
  const where = {};
  if (fecha) where.fecha = fecha;
  if (profesionalId) where.profesionalId = profesionalId;
  if (estado) where.estado = estado;

  const citas = await Cita.findAll({
    where,
    include: [Cliente, Profesional, Servicio],
    order: [['fecha', 'ASC'], ['hora', 'ASC']],
  });
  res.json(citas);
}

/**
 * PUT /api/citas/:id/estado (solo admin) -> cambiar estado manualmente
 * body: { estado: 'confirmada' | 'cancelada' | 'completada' | 'pendiente' }
 */
async function cambiarEstado(req, res) {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada.' });

    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }

    await cita.update({ estado });
    res.json(cita);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar el estado de la cita.' });
  }
}

module.exports = { disponibilidad, crear, cancelar, listar, cambiarEstado };
