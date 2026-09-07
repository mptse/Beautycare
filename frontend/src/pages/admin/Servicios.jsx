import { useEffect, useState } from 'react';
import api from '../../api/client';

const VACIO = { nombre: '', descripcion: '', precio: '', duracionMinutos: '', imagenUrl: '' };

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  function cargar() {
    api.get('/servicios/todos').then((res) => setServicios(res.data));
  }
  useEffect(cargar, []);

  function editar(servicio) {
    setEditandoId(servicio.id);
    setForm({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      precio: servicio.precio,
      duracionMinutos: servicio.duracionMinutos,
      imagenUrl: servicio.imagenUrl || '',
    });
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
        await api.put(`/servicios/${editandoId}`, { ...form, activo: true });
      } else {
        await api.post('/servicios', form);
      }
      cancelarEdicion();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar el servicio.');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este servicio?')) return;
    await api.delete(`/servicios/${id}`);
    cargar();
  }

  async function alternarActivo(servicio) {
    await api.put(`/servicios/${servicio.id}`, { ...servicio, activo: !servicio.activo });
    cargar();
  }

  return (
    <div className="page">
      <div className="container">
        <h1>Servicios</h1>
        <p>Estos son los servicios que los clientes ven al reservar. Desactiva uno sin borrarlo si dejas de ofrecerlo temporalmente.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={guardar} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 32 }}>
          <div className="field" style={{ marginBottom: 0, flex: '1 1 180px' }}>
            <label>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="field" style={{ marginBottom: 0, flex: '2 1 240px' }}>
            <label>Descripción</label>
            <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 0, flex: '0 1 120px' }}>
            <label>Precio</label>
            <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required />
          </div>
          <div className="field" style={{ marginBottom: 0, flex: '0 1 120px' }}>
            <label>Duración (min)</label>
            <input type="number" value={form.duracionMinutos} onChange={(e) => setForm({ ...form, duracionMinutos: e.target.value })} required />
          </div>
          <div className="field" style={{ marginBottom: 0, flex: '2 1 260px' }}>
            <label>URL de la imagen</label>
            <input value={form.imagenUrl} onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })} placeholder="https://…" />
          </div>
          <button className="btn btn-primary">{editandoId ? 'Guardar cambios' : 'Agregar servicio'}</button>
          {editandoId && <button type="button" className="btn btn-outline" onClick={cancelarEdicion}>Cancelar</button>}
        </form>

        {servicios.map((s) => (
          <div className="list-item" key={s.id}>
            <div className="list-item-info" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {s.imagenUrl && <img className="thumb-sm" src={s.imagenUrl} alt={s.nombre} />}
              <div>
                <h3>{s.nombre} {!s.activo && <span className="badge badge-cancelada">inactivo</span>}</h3>
                <div className="list-item-meta">${s.precio} · {s.duracionMinutos} min</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => alternarActivo(s)}>
                {s.activo ? 'Desactivar' : 'Activar'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => editar(s)}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminar(s.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}