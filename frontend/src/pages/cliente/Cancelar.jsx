import { useState } from 'react';
import api from '../../api/client';

export default function Cancelar() {
  const [citaId, setCitaId] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMensaje(null);
    setEnviando(true);
    try {
      const { data } = await api.put(`/citas/${citaId}/cancelar`, { telefono });
      setMensaje(data.mensaje);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos cancelar la cita.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 480 }}>
        <h1>Cancelar cita</h1>
        <p>Ingresa el número de tu cita y el teléfono con el que la reservaste.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        {!mensaje && (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Número de cita</label>
              <input value={citaId} onChange={(e) => setCitaId(e.target.value)} placeholder="Ej: 12" required />
            </div>
            <div className="field">
              <label>Teléfono usado en la reserva</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
            </div>
            <button className="btn btn-danger" disabled={enviando}>
              {enviando ? 'Cancelando…' : 'Cancelar cita'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
