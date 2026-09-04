require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const servicioRoutes = require('./routes/servicioRoutes');
const profesionalRoutes = require('./routes/profesionalRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const citaRoutes = require('./routes/citaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba para confirmar que el servidor está vivo
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de BeautyCare funcionando correctamente 💅' });
});

app.use('/api/auth', authRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/profesionales', profesionalRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/citas', citaRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

const PORT = process.env.PORT || 4000;

// Verificamos la conexión a la base de datos antes de levantar el servidor
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida.');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ No se pudo conectar a la base de datos:', err);
  });
