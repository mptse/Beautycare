import { useEffect, useState } from 'react';
import api from '../../api/client';

function formatoPrecio(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
}

const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS_DISPONIBLES = [ANIO_ACTUAL, ANIO_ACTUAL - 1, ANIO_ACTUAL - 2];

export default function Reportes() {
  const [anio, setAnio] = useState(ANIO_ACTUAL);
  const [reporte, setReporte] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(null);
  const [desglose, setDesglose] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoDesglose, setCargandoDesglose] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCargando(true);
    setMesSeleccionado(null);
    setDesglose(null);
    api.get('/reportes/ingresos', { params: { anio } })
      .then((res) => setReporte(res.data))
      .catch(() => setError('No pudimos cargar el reporte.'))
      .finally(() => setCargando(false));
  }, [anio]);

  function verDesglose(mes) {
    if (mesSeleccionado === mes) {
      setMesSeleccionado(null);
      setDesglose(null);
      return;
    }
    setMesSeleccionado(mes);
    setCargandoDesglose(true);
    api.get('/reportes/ingresos-mes', { params: { anio, mes } })
      .then((res) => setDesglose(res.data))
      .catch(() => setError('No pudimos cargar el desglose de ese mes.'))
      .finally(() => setCargandoDesglose(false));
  }

  const maxIngreso = reporte ? Math.max(...reporte.meses.map((m) => m.totalIngresos), 1) : 1;

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <h1>Reportes de ingresos</h1>
            <p>Basado en las citas marcadas como <strong>completada</strong> — así el reporte refleja dinero realmente ganado.</p>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Año</label>
            <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
              {ANIOS_DISPONIBLES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {cargando && <p className="text-soft">Calculando…</p>}

        {!cargando && reporte && (
          <>
            <div className="report-summary mt-24">
              <div className="report-summary-item">
                <div className="report-summary-value">{formatoPrecio(reporte.totalAnual)}</div>
                <div className="text-soft">Ingresos de {anio}</div>
              </div>
              <div className="report-summary-item">
                <div className="report-summary-value">{reporte.totalCitas}</div>
                <div className="text-soft">Citas completadas</div>
              </div>
              <div className="report-summary-item">
                <div className="report-summary-value">
                  {formatoPrecio(reporte.totalCitas ? reporte.totalAnual / reporte.totalCitas : 0)}
                </div>
                <div className="text-soft">Promedio por cita</div>
              </div>
            </div>

            <h3 className="mt-40">Ingresos por mes</h3>
            <p className="text-soft" style={{ marginTop: -6 }}>Haz clic en un mes para ver el detalle por servicio y por profesional.</p>

            <div className="revenue-chart">
              {reporte.meses.map((m) => (
                <button
                  key={m.mes}
                  className={`revenue-bar-col ${mesSeleccionado === m.mes ? 'selected' : ''}`}
                  onClick={() => verDesglose(m.mes)}
                  title={`${m.nombre}: ${formatoPrecio(m.totalIngresos)}`}
                >
                  <span className="revenue-bar-value">
                    {m.totalIngresos > 0 ? formatoPrecio(m.totalIngresos).replace('COP', '').trim() : ''}
                  </span>
                  <span
                    className="revenue-bar"
                    style={{ height: `${Math.max((m.totalIngresos / maxIngreso) * 140, m.totalIngresos > 0 ? 6 : 2)}px` }}
                  />
                  <span className="revenue-bar-label">{m.nombre.slice(0, 3)}</span>
                </button>
              ))}
            </div>

            {mesSeleccionado && (
              <div className="mt-40">
                {cargandoDesglose && <p className="text-soft">Cargando detalle…</p>}
                {!cargandoDesglose && desglose && (
                  <>
                    <h3>Detalle de {desglose.nombreMes}</h3>
                    {desglose.cantidadCitas === 0 ? (
                      <div className="empty-state">No hubo citas completadas ese mes.</div>
                    ) : (
                      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 240 }}>
                          <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Por servicio</h4>
                          {desglose.porServicio.map((s) => (
                            <div key={s.nombre} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                              <span>{s.nombre} <span className="text-soft">×{s.cantidad}</span></span>
                              <strong>{formatoPrecio(s.total)}</strong>
                            </div>
                          ))}
                        </div>
                        <div style={{ flex: 1, minWidth: 240 }}>
                          <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Por profesional</h4>
                          {desglose.porProfesional.map((p) => (
                            <div key={p.nombre} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                              <span>{p.nombre} <span className="text-soft">×{p.cantidad}</span></span>
                              <strong>{formatoPrecio(p.total)}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}