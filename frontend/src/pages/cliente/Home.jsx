import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

function formatoPrecio(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
}

export default function Home() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/servicios')
      .then((res) => setServicios(res.data))
      .catch(() => setError('No pudimos cargar los servicios. Intenta de nuevo en un momento.'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="page">
      <div className="container">
        <h1>Cuidado que se nota</h1>
        <p>Manicura y tratamientos faciales hechos por profesionales. Elige un servicio y reserva tu horario en un par de minutos.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {cargando && <p className="text-soft">Cargando servicios…</p>}

        {!cargando && servicios.length === 0 && !error && (
          <div className="empty-state">Todavía no hay servicios publicados.</div>
        )}

        <div className="mt-40">
          {servicios.map((s) => (
            <div className="list-item" key={s.id}>
              <div className="list-item-info">
                <h3>{s.nombre}</h3>
                <p style={{ margin: '4px 0' }}>{s.descripcion}</p>
                <div className="list-item-meta">{formatoPrecio(s.precio)} · {s.duracionMinutos} min</div>
              </div>
              <Link to={`/reservar?servicioId=${s.id}`} className="btn btn-primary btn-sm">Reservar</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
