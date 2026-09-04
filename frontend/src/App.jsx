import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/cliente/Home';
import Reservar from './pages/cliente/Reservar';
import Cancelar from './pages/cliente/Cancelar';

import Login from './pages/admin/Login';
import Citas from './pages/admin/Citas';
import Servicios from './pages/admin/Servicios';
import Profesionales from './pages/admin/Profesionales';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />

          <Routes>
            {/* Rutas del cliente */}
            <Route path="/" element={<Home />} />
            <Route path="/reservar" element={<Reservar />} />
            <Route path="/cancelar" element={<Cancelar />} />

            {/* Rutas del administrador */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><Citas /></ProtectedRoute>} />
            <Route path="/admin/servicios" element={<ProtectedRoute><Servicios /></ProtectedRoute>} />
            <Route path="/admin/profesionales" element={<ProtectedRoute><Profesionales /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
