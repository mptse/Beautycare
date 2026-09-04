const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cita = sequelize.define('Cita', {
  fecha: {
    type: DataTypes.DATEONLY, // "YYYY-MM-DD"
    allowNull: false,
  },
  hora: {
    type: DataTypes.STRING, // "HH:mm"
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada'),
    defaultValue: 'pendiente',
  },
});

module.exports = Cita;
