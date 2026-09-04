import { useEffect, useState } from 'react';
import api from '../../api/client';

const ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'completada'];

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroProfesional, setFiltroProfesional] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    api.get('/profesionales/todos').then((res) => setProfesionales(res.data));
  }, []);

  function cargarCitas() {
    setCargando(true);
    const params = {};
    if (filtroFecha) params.fecha = filtroFecha;
    if (filtroProfesional) params.profesionalId = filtroProfesional;
    if (filtroEstado) params.estado = filtroEstado;

    api.get('/citas', { params })
      .then((res) => setCitas(res.data))
      .catch(() => setError('No pudimos cargar las citas.'))
      .finally(() => setCargando(false));
  }

  useEffect(cargarCitas, [filtroFecha, filtroProfesional, filtroEstado]);

  async function cambiarEstado(citaId, nuevoEstado) {
    try {
      await api.put(`/citas/${citaId}/estado`, { estado: nuevoEstado });
      cargarCitas();
    } catch {
      setError('No pudimos actualizar el estado de la cita.');
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h1>Citas</h1>
        <p>Consulta y gestiona todas las citas agendadas por los clientes.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Fecha</label>
            <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Profesional</label>
            <select value={filtroProfesional} onChange={(e) => setFiltroProfesional(e.target.value)}>
              <option value="">Todos</option>
              {profesionales.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos</option>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {cargando && <p className="text-soft">Cargando citas…</p>}
        {!cargando && citas.length === 0 && <div className="empty-state">No hay citas con esos filtros.</div>}

        {!cargando && citas.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Profesional</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>{c.fecha}</td>
                  <td>{c.hora}</td>
                  <td>{c.Cliente?.nombre}<br /><span className="text-soft">{c.Cliente?.telefono}</span></td>
                  <td>{c.Servicio?.nombre}</td>
                  <td>{c.Profesional?.nombre}</td>
                  <td>
                    <select
                      value={c.estado}
                      onChange={(e) => cambiarEstado(c.id, e.target.value)}
                      className={`badge badge-${c.estado}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
