const jwt = require('jsonwebtoken');

// Este middleware protege las rutas que solo el administrador puede usar.
// Revisa que venga un token válido en el header "Authorization: Bearer <token>".
function verificarAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Falta el token de acceso.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // guardamos los datos del admin por si se necesitan más adelante
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

module.exports = verificarAdmin;
