// Este script:
// 1. Crea (o recrea) todas las tablas según los modelos definidos.
// 2. Inserta datos de ejemplo para poder probar la aplicación de inmediato.
//
// Ejecutar con: npm run seed

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Admin, Servicio, Profesional, Horario } = require('./models');

async function seed() {
  // force:true elimina las tablas existentes y las vuelve a crear (solo para desarrollo)
  await sequelize.sync({ force: true });
  console.log('Tablas creadas.');

  // --- Admin de ejemplo ---
  const passwordHash = await bcrypt.hash('admin123', 10);
  await Admin.create({
    nombre: 'Administrador',
    email: 'admin@beautycare.com',
    password: passwordHash,
  });
  console.log('Admin creado -> email: admin@beautycare.com / password: admin123');

  // --- Servicios de ejemplo ---
  const servicios = await Servicio.bulkCreate([
    { nombre: 'Manicura clásica', descripcion: 'Limado, cutícula y esmaltado tradicional', precio: 25000, duracionMinutos: 45 },
    { nombre: 'Manicura semipermanente', descripcion: 'Esmaltado de larga duración con secado UV', precio: 40000, duracionMinutos: 60 },
    { nombre: 'Limpieza facial profunda', descripcion: 'Limpieza, exfoliación e hidratación', precio: 60000, duracionMinutos: 75 },
    { nombre: 'Tratamiento antiedad', descripcion: 'Tratamiento facial con masaje y serum', precio: 90000, duracionMinutos: 90 },
  ]);
  console.log(`${servicios.length} servicios creados.`);

  // --- Profesionales de ejemplo ---
  const profesionales = await Profesional.bulkCreate([
    { nombre: 'Laura Gómez', especialidad: 'Manicura y uñas' },
    { nombre: 'Camila Rojas', especialidad: 'Cuidado facial' },
  ]);
  console.log(`${profesionales.length} profesionales creados.`);

  // --- Horarios de ejemplo (Lunes a Sábado, 8am a 5pm para ambas) ---
  const horarios = [];
  for (const prof of profesionales) {
    for (let dia = 1; dia <= 6; dia++) { // 1=Lunes ... 6=Sábado
      horarios.push({
        profesionalId: prof.id,
        diaSemana: dia,
        horaInicio: '08:00',
        horaFin: '17:00',
      });
    }
  }
  await Horario.bulkCreate(horarios);
  console.log(`${horarios.length} horarios creados.`);

  console.log('\n✅ Seed completado con éxito.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error en el seed:', err);
  process.exit(1);
});
