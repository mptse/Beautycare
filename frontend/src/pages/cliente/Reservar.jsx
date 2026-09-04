import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';

const PASOS = ['Servicio', 'Profesional', 'Horario', 'Tus datos'];

function formatoPrecio(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
}

function formatoFechaLegible(fechaISO) {
  const [y, m, d] = fechaISO.split('-');
  const fecha = new Date(Number(y), Number(m) - 1, Number(d));
  return fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Genera las próximas 14 fechas (como strings "YYYY-MM-DD") para que el cliente elija día.
function proximasFechas(cantidad = 14) {
  const fechas = [];
  const hoy = new Date();
  for (let i = 0; i < cantidad; i++) {
    const f = new Date(hoy);
    f.setDate(hoy.getDate() + i);
    fechas.push(f.toISOString().split('T')[0]);
  }
  return fechas;
}

export default function Reservar() {
  const [searchParams] = useSearchParams();
  const [pasoActual, setPasoActual] = useState(0);

  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);

  const [servicioId, setServicioId] = useState(searchParams.get('servicioId') || '');
  const [profesionalId, setProfesionalId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [citaConfirmada, setCitaConfirmada] = useState(null);

  const fechas = useMemo(() => proximasFechas(), []);
  const servicioSeleccionado = servicios.find((s) => String(s.id) === String(servicioId));
  const profesionalSeleccionado = profesionales.find((p) => String(p.id) === String(profesionalId));

  useEffect(() => {
    api.get('/servicios').then((res) => setServicios(res.data));
    api.get('/profesionales').then((res) => setProfesionales(res.data));
  }, []);

  useEffect(() => {
    if (!profesionalId || !servicioId || !fecha) {
      setHorasDisponibles([]);
      return;
    }
    setCargandoHoras(true);
    setHora('');
    api.get('/citas/disponibilidad', { params: { profesionalId, servicioId, fecha } })
      .then((res) => setHorasDisponibles(res.data))
      .catch(() => setError('No pudimos calcular la disponibilidad.'))
      .finally(() => setCargandoHoras(false));
  }, [profesionalId, servicioId, fecha]);

  function irSiguiente() {
    setError('');
    setPasoActual((p) => Math.min(p + 1, PASOS.length - 1));
  }
  function irAtras() {
    setError('');
    setPasoActual((p) => Math.max(p - 1, 0));
  }

  async function confirmarReserva(e) {
    e.preventDefault();
    setError('');
    if (!nombre || !telefono) {
      setError('Nombre y teléfono son obligatorios.');
      return;
    }
    setEnviando(true);
    try {
      const { data } = await api.post('/citas', {
        nombre, telefono, email, profesionalId, servicioId, fecha, hora,
      });
      setCitaConfirmada(data);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos crear la cita. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  if (citaConfirmada) {
    return (
      <div className="page">
        <div className="container">
          <h1>Tu cita está reservada</h1>
          <p>Te esperamos el {formatoFechaLegible(citaConfirmada.fecha)} a las {citaConfirmada.hora} con {citaConfirmada.Profesional.nombre}.</p>
          <div className="alert alert-success" style={{ maxWidth: 420 }}>
            Número de tu cita: <strong>#{citaConfirmada.id}</strong>. Guárdalo junto con tu teléfono
            por si necesitas cancelarla más adelante.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1>Reserva tu cita</h1>

        <div className="steps mt-40">
          {PASOS.map((nombrePaso, i) => (
            <div key={nombrePaso} className={`step ${i === pasoActual ? 'active' : ''} ${i < pasoActual ? 'done' : ''}`}>
              {nombrePaso}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Paso 1: Servicio */}
        {pasoActual === 0 && (
          <div>
            <h3>¿Qué servicio quieres agendar?</h3>
            <div className="chip-grid">
              {servicios.map((s) => (
                <div
                  key={s.id}
                  className={`chip ${String(s.id) === String(servicioId) ? 'selected' : ''}`}
                  onClick={() => setServicioId(String(s.id))}
                >
                  {s.nombre} · {formatoPrecio(s.precio)}
                </div>
              ))}
            </div>
            <div className="mt-40">
              <button className="btn btn-primary" disabled={!servicioId} onClick={irSiguiente}>Continuar</button>
            </div>
          </div>
        )}

        {/* Paso 2: Profesional */}
        {pasoActual === 1 && (
          <div>
            <h3>¿Con quién prefieres tu cita?</h3>
            <div className="chip-grid">
              {profesionales.map((p) => (
                <div
                  key={p.id}
                  className={`chip ${String(p.id) === String(profesionalId) ? 'selected' : ''}`}
                  onClick={() => setProfesionalId(String(p.id))}
                >
                  {p.nombre} · {p.especialidad}
                </div>
              ))}
            </div>
            <div className="mt-40 flex-between" style={{ justifyContent: 'flex-start', gap: 12 }}>
              <button className="btn btn-outline" onClick={irAtras}>Atrás</button>
              <button className="btn btn-primary" disabled={!profesionalId} onClick={irSiguiente}>Continuar</button>
            </div>
          </div>
        )}

        {/* Paso 3: Fecha y hora */}
        {pasoActual === 2 && (
          <div>
            <h3>Elige el día</h3>
            <div className="chip-grid">
              {fechas.map((f) => (
                <div
                  key={f}
                  className={`chip ${f === fecha ? 'selected' : ''}`}
                  onClick={() => setFecha(f)}
                >
                  {formatoFechaLegible(f)}
                </div>
              ))}
            </div>

            {fecha && (
              <div className="mt-24">
                <h3>Elige la hora</h3>
                {cargandoHoras && <p className="text-soft">Calculando horas disponibles…</p>}
                {!cargandoHoras && horasDisponibles.length === 0 && (
                  <p className="text-soft">No hay horas disponibles ese día para {profesionalSeleccionado?.nombre}. Prueba otro día.</p>
                )}
                <div className="chip-grid">
                  {horasDisponibles.map((h) => (
                    <div key={h} className={`chip ${h === hora ? 'selected' : ''}`} onClick={() => setHora(h)}>
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-40" style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={irAtras}>Atrás</button>
              <button className="btn btn-primary" disabled={!fecha || !hora} onClick={irSiguiente}>Continuar</button>
            </div>
          </div>
        )}

        {/* Paso 4: Datos del cliente */}
        {pasoActual === 3 && (
          <form onSubmit={confirmarReserva}>
            <h3>Resumen de tu cita</h3>
            <p>
              {servicioSeleccionado?.nombre} con {profesionalSeleccionado?.nombre}<br />
              {formatoFechaLegible(fecha)} a las {hora} · {formatoPrecio(servicioSeleccionado?.precio || 0)}
            </p>

            <div className="field">
              <label>Nombre completo</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
            </div>
            <div className="field">
              <label>Correo (opcional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="mt-24" style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn btn-outline" onClick={irAtras}>Atrás</button>
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? 'Reservando…' : 'Confirmar reserva'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
