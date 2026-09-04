const sequelize = require('../config/database');
const Admin = require('./Admin');
const Cliente = require('./Cliente');
const Servicio = require('./Servicio');
const Profesional = require('./Profesional');
const Horario = require('./Horario');
const Cita = require('./Cita');

// --- Relaciones ---

// Un Profesional tiene muchos Horarios
Profesional.hasMany(Horario, { foreignKey: 'profesionalId', onDelete: 'CASCADE' });
Horario.belongsTo(Profesional, { foreignKey: 'profesionalId' });

// Un Profesional tiene muchas Citas
Profesional.hasMany(Cita, { foreignKey: 'profesionalId' });
Cita.belongsTo(Profesional, { foreignKey: 'profesionalId' });

// Un Servicio puede estar en muchas Citas
Servicio.hasMany(Cita, { foreignKey: 'servicioId' });
Cita.belongsTo(Servicio, { foreignKey: 'servicioId' });

// Un Cliente puede tener muchas Citas
Cliente.hasMany(Cita, { foreignKey: 'clienteId' });
Cita.belongsTo(Cliente, { foreignKey: 'clienteId' });

module.exports = {
  sequelize,
  Admin,
  Cliente,
  Servicio,
  Profesional,
  Horario,
  Cita,
};
