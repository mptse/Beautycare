// Configuración de la conexión a la base de datos.
// Usamos SQLite en desarrollo (archivo local, cero configuración).
// Para pasar a PostgreSQL en producción solo hay que cambiar 'dialect'
// y las credenciales, el resto del código (modelos, controladores) no cambia.

const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'database.sqlite'),
  logging: false, // poner console.log para ver las consultas SQL generadas
});

module.exports = sequelize;
