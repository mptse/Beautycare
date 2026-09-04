const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// diaSemana: 0=Domingo, 1=Lunes, ... 6=Sábado
const Horario = sequelize.define('Horario', {
  diaSemana: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 6 },
  },
  horaInicio: {
    type: DataTypes.STRING, // formato "HH:mm"
    allowNull: false,
  },
  horaFin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Horario;
