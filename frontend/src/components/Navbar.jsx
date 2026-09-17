import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const enAdmin = location.pathname.startsWith('/admin');
  const [menuAbierto, setMenuAbierto] = useState(false);

  function isActive(path) {
    return location.pathname === path ? 'active' : '';
  }

  function handleLogout() {
    setMenuAbierto(false);
    logout();
    navigate('/admin/login');
  }

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  const mostrarLinksCliente = !enAdmin;
  const mostrarLinksAdmin = enAdmin && isAuthenticated;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={cerrarMenu}>Beauty<span>Care</span></Link>

        {(mostrarLinksCliente || mostrarLinksAdmin) && (
          <button
            className="navbar-toggle"
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto((v) => !v)}
          >
            {menuAbierto ? '✕' : '☰'}
          </button>
        )}

        {mostrarLinksCliente && (
          <nav className={`nav-links ${menuAbierto ? 'open' : ''}`}>
            <Link to="/" className={isActive('/')} onClick={cerrarMenu}>Servicios</Link>
            <Link to="/reservar" className={isActive('/reservar')} onClick={cerrarMenu}>Reservar</Link>
            <Link to="/cancelar" className={isActive('/cancelar')} onClick={cerrarMenu}>Cancelar cita</Link>
            <Link to="/admin/login" className="text-soft" onClick={cerrarMenu}>Administrador</Link>
          </nav>
        )}

        {mostrarLinksAdmin && (
          <nav className={`nav-links ${menuAbierto ? 'open' : ''}`}>
            <Link to="/admin" className={isActive('/admin')} onClick={cerrarMenu}>Citas</Link>
            <Link to="/admin/servicios" className={isActive('/admin/servicios')} onClick={cerrarMenu}>Servicios</Link>
            <Link to="/admin/profesionales" className={isActive('/admin/profesionales')} onClick={cerrarMenu}>Profesionales</Link>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Cerrar sesión</button>
          </nav>
        )}
      </div>
    </header>
  );
}