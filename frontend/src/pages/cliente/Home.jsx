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
    <>
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">Manicura · Cuidado facial</div>
          <h1>Cuidado que se nota</h1>
          <p>Servicios de manicura y tratamientos faciales hechos por profesionales. Elige lo que necesitas y reserva tu horario en un par de minutos.</p>
          <Link to="/reservar" className="btn btn-primary mt-24">Reservar ahora</Link>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 48 }}>
        <div className="container">
          <h2>Nuestros servicios</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {cargando && <p className="text-soft">Cargando servicios…</p>}

          {!cargando && servicios.length === 0 && !error && (
            <div className="empty-state">Todavía no hay servicios publicados.</div>
          )}

          <div className="service-grid mt-24">
            {servicios.map((s) => (
              <div className="service-card" key={s.id}>
                {s.imagenUrl && (
                  <img className="service-card-image" src={s.imagenUrl} alt={s.nombre} loading="lazy" />
                )}
                <div className="service-card-body">
                  <h3 style={{ margin: 0 }}>{s.nombre}</h3>
                  <p>{s.descripcion}</p>
                  <div className="service-card-footer">
                    <div>
                      <div className="service-price">{formatoPrecio(s.precio)}</div>
                      <div className="text-soft">{s.duracionMinutos} min</div>
                    </div>
                    <Link to={`/reservar?servicioId=${s.id}`} className="btn btn-primary btn-sm">Reservar</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="site-footer">
        BeautyCare — hecho con cuidado, para cuidar de ti.
      </footer>
    </>
  );
}