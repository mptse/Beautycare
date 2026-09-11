const rateLimit = require('express-rate-limit');

// Límite estricto para el login: evita que alguien intente adivinar
// la contraseña del administrador probando muchas combinaciones seguidas.
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // ventana de 15 minutos
  max: 10, // máximo 10 intentos de login por IP en esa ventana
  message: { error: 'Demasiados intentos de inicio de sesión. Espera unos minutos e intenta de nuevo.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite más flexible para crear citas: evita que un script sature el
// sistema de reservas falsas, sin molestar a un cliente normal.
const limiteCitas = rateLimit({
  windowMs: 10 * 60 * 1000, // ventana de 10 minutos
  max: 20, // máximo 20 citas creadas por IP en esa ventana
  message: { error: 'Estás haciendo demasiadas reservas seguidas. Espera unos minutos e intenta de nuevo.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite general para toda la API: una red de seguridad amplia contra
// cualquier abuso que no esté cubierto por los límites específicos.
const limiteGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 peticiones por IP cada 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { limiteLogin, limiteCitas, limiteGeneral };