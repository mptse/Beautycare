import { useEffect, useState } from 'react';
import api from '../../api/client';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const VACIO = { nombre: '', especialidad: '' };

export default function Profesionales() {
  const [profesionales, setProfesionales] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [expandidoId, setExpandidoId] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [nuevoHorario, setNuevoHorario] = useState({ diaSemana: '1', horaInicio: '08:00', horaFin: '17:00' });
  const [error, setError] = useState('');

  function cargar() {
    api.get('/profesionales/todos').then((res) => setProfesionales(res.data));
  }
  useEffect(cargar, []);

  function editar(p) {
    setEditandoId(p.id);
    setForm({ nombre: p.nombre, especialidad: p.especialidad || '' });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm(VACIO);
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        await api.put(`/profesionales/${editandoId}`, { ...form, activo: true });
      } else {
        await api.post('/profesionales', form);
      }
      cancelarEdicion();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar el profesional.');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este profesional? También se eliminarán sus horarios.')) return;
    await api.delete(`/profesionales/${id}`);
    cargar();
  }

  async function verHorarios(profesionalId) {
    if (expandidoId === profesionalId) {
      setExpandidoId(null);
      return;
    }
    setExpandidoId(profesionalId);
    const { data } = await api.get(`/profesionales/${profesionalId}/horarios`);
    setHorarios(data);
  }

  async function agregarHorario(profesionalId) {
    await api.post('/horarios', { profesionalId, ...nuevoHorario });
    const { data } = await api.get(`/profesionales/${profesionalId}/horarios`);
    setHorarios(data);
  }

  async function eliminarHorario(horarioId, profesionalId) {
    await api.delete(`/horarios/${horarioId}`);
    const { data } = await api.get(`/profesionales/${profesionalId}/horarios`);
    setHorarios(data);
  }

  return (
    <div className="page">
      <div className="container">
        <h1>Profesionales</h1>
        <p>Agrega a tu equipo y define en qué días y horas atiende cada uno.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={guardar} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 32 }}>
          <div className="field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label>Especialidad</label>
            <input value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} />
          </div>
          <button className="btn btn-primary">{editandoId ? 'Guardar cambios' : 'Agregar profesional'}</button>
          {editandoId && <button type="button" className="btn btn-outline" onClick={cancelarEdicion}>Cancelar</button>}
        </form>

        {profesionales.map((p) => (
          <div key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="list-item" style={{ borderBottom: 'none' }}>
              <div className="list-item-info">
                <h3>{p.nombre}</h3>
                <div className="list-item-meta">{p.especialidad}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => verHorarios(p.id)}>
                  {expandidoId === p.id ? 'Ocultar horarios' : 'Ver horarios'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => editar(p)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => eliminar(p.id)}>Eliminar</button>
              </div>
            </div>

            {expandidoId === p.id && (
              <div style={{ background: 'var(--color-surface)', padding: '16px 0 24px' }}>
                {horarios.length === 0 && <p className="text-soft">Sin horarios definidos todavía.</p>}
                {horarios.map((h) => (
                  <div key={h.id} className="flex-between" style={{ padding: '6px 0', maxWidth: 420 }}>
                    <span>{DIAS[h.diaSemana]}: {h.horaInicio} – {h.horaFin}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => eliminarHorario(h.id, p.id)}>Quitar</button>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 16, flexWrap: 'wrap' }}>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Día</label>
                    <select value={nuevoHorario.diaSemana} onChange={(e) => setNuevoHorario({ ...nuevoHorario, diaSemana: e.target.value })}>
                      {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Desde</label>
                    <input type="time" value={nuevoHorario.horaInicio} onChange={(e) => setNuevoHorario({ ...nuevoHorario, horaInicio: e.target.value })} />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Hasta</label>
                    <input type="time" value={nuevoHorario.horaFin} onChange={(e) => setNuevoHorario({ ...nuevoHorario, horaFin: e.target.value })} />
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => agregarHorario(p.id)}>Agregar bloque</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
