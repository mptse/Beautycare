# BeautyCare 💅

Sistema de gestión de citas para un negocio de manicura y cuidado de la piel.
Incluye un sitio web para que los clientes reserven citas y un panel de administración
para gestionar servicios, profesionales, horarios y citas.

📄 Lee `docs/03-arquitectura.md` para entender cómo está armado todo por dentro.

## Requisitos previos

- **Node.js** versión 18 o superior. Descárgalo de https://nodejs.org si no lo tienes.
- Dos terminales abiertas (una para el backend, otra para el frontend). En VS Code puedes abrir una segunda con el ícono `+` en el panel de terminal.

## Instalación (primera vez)

### 1. Backend

```
cd backend
npm install
npm run seed
npm run dev
```

Debe quedar corriendo y mostrar:
```
✅ Conexión a la base de datos establecida.
🚀 Servidor corriendo en http://localhost:4000
```
Déjalo corriendo en esa terminal, no la cierres.

### 2. Frontend (en una segunda terminal)

```
cd frontend
npm install
npm run dev
```

Debe mostrarte algo como:
```
➜  Local:   http://localhost:5173/
```

Abre esa dirección en tu navegador — ¡ahí está la página web funcionando!

## Cómo probar todo

### Como cliente
1. Entra a http://localhost:5173
2. Verás los servicios disponibles. Dale clic a "Reservar" en cualquiera.
3. Sigue los 4 pasos: servicio → profesional → fecha y hora → tus datos.
4. Al confirmar, te mostrará el número de tu cita — guárdalo si quieres cancelarla después desde "Cancelar cita" en el menú.

### Como administrador
1. Entra a http://localhost:5173/admin/login
2. Usa las credenciales de prueba:
   - Email: `admin@beautycare.com`
   - Password: `admin123`
3. Desde ahí puedes ver todas las citas, cambiar su estado, y gestionar servicios y profesionales (incluyendo sus horarios de trabajo).

## Estructura del proyecto

```
beautycare/
├── docs/            → Documentación (requisitos, modelo de datos, arquitectura)
├── backend/         → API en Node.js + Express + Sequelize (SQLite)
└── frontend/        → Sitio web en React (cliente + panel admin)
```

## Endpoints de la API (backend)

### Públicos (cliente)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/servicios` | Lista de servicios activos |
| GET | `/api/profesionales` | Lista de profesionales activos |
| GET | `/api/profesionales/:id/horarios` | Horario semanal de un profesional |
| GET | `/api/citas/disponibilidad?profesionalId=&servicioId=&fecha=` | Horas disponibles ese día |
| POST | `/api/citas` | Crear una cita |
| PUT | `/api/citas/:id/cancelar` | Cancelar una cita (requiere `telefono` en el body) |
| POST | `/api/auth/login` | Login del administrador |

### Protegidos (requieren header `Authorization: Bearer <token>`)
| Método | Ruta | Descripción |
|---|---|---|
| GET `/api/servicios/todos`, POST/PUT/DELETE `/api/servicios` | CRUD de servicios |
| GET `/api/profesionales/todos`, POST/PUT/DELETE `/api/profesionales` | CRUD de profesionales |
| POST/PUT/DELETE `/api/horarios` | CRUD de horarios |
| GET `/api/citas?fecha=&profesionalId=&estado=` | Listar todas las citas (con filtros) |
| PUT `/api/citas/:id/estado` | Cambiar estado de una cita |

## Estado del proyecto
- [x] Documentación (requisitos, modelo de datos, arquitectura)
- [x] Backend: base de datos, modelos y API REST completa
- [x] Frontend cliente: catálogo, reserva paso a paso, cancelación
- [x] Frontend admin: login, gestión de citas/servicios/profesionales/horarios

## Posibles mejoras futuras
- Notificaciones por correo o WhatsApp al reservar/cancelar
- Pagos en línea
- Migrar la base de datos a PostgreSQL para producción
- Subir el proyecto a un hosting real (backend en Render/Railway, frontend en Vercel/Netlify)
