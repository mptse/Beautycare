import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const enAdmin = location.pathname.startsWith('/admin');

  function isActive(path) {
    return location.pathname === path ? 'active' : '';
  }

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">Beauty<span>Care</span></Link>

        {!enAdmin && (
          <nav className="nav-links">
            <Link to="/" className={isActive('/')}>Servicios</Link>
            <Link to="/reservar" className={isActive('/reservar')}>Reservar</Link>
            <Link to="/cancelar" className={isActive('/cancelar')}>Cancelar cita</Link>
            <Link to="/admin/login" className="text-soft">Administrador</Link>
          </nav>
        )}

        {enAdmin && isAuthenticated && (
          <nav className="nav-links">
            <Link to="/admin" className={isActive('/admin')}>Citas</Link>
            <Link to="/admin/servicios" className={isActive('/admin/servicios')}>Servicios</Link>
            <Link to="/admin/profesionales" className={isActive('/admin/profesionales')}>Profesionales</Link>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Cerrar sesión</button>
          </nav>
        )}
      </div>
    </header>
  );
}
