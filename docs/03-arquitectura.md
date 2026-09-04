# BeautyCare — Arquitectura del Sistema

## 1. Visión general

```
┌─────────────────────┐        HTTP/JSON        ┌──────────────────────┐
│   FRONTEND (React)  │ ───────────────────────► │   BACKEND (Express)  │
│   localhost:5173     │ ◄─────────────────────── │   localhost:4000      │
│                       │                          │                       │
│  - Sitio cliente      │                          │  - API REST           │
│  - Panel admin        │                          │  - Reglas de negocio  │
└──────────────────────┘                          │  - Autenticación JWT  │
                                                    └──────────┬───────────┘
                                                               │
                                                               ▼
                                                    ┌──────────────────────┐
                                                    │  BASE DE DATOS        │
                                                    │  SQLite (archivo)     │
                                                    │  database.sqlite      │
                                                    └──────────────────────┘
```

El frontend nunca habla directo con la base de datos: siempre pasa por la API del backend, que es quien valida las reglas de negocio (por ejemplo, que no se agende una cita en un horario ya ocupado).

## 2. ¿Por qué esta arquitectura?

- **Separación cliente/servidor**: el frontend (lo visual) y el backend (la lógica y los datos) son proyectos independientes que se pueden desplegar y escalar por separado.
- **API REST**: un estándar simple y ampliamente soportado — cualquier futura app (por ejemplo, una app móvil real) podría consumir la misma API sin cambios en el backend.
- **SQLite en desarrollo**: cero configuración, el proyecto funciona apenas lo descargas. Migrar a PostgreSQL en producción implica cambiar unas pocas líneas en `backend/src/config/database.js`, no reescribir modelos ni controladores.
- **JWT para autenticación**: el admin inicia sesión una vez y recibe un "pase" (token) que demuestra quién es en cada petición siguiente, sin tener que reenviar su contraseña cada vez.

## 3. Estructura de carpetas

```
beautycare/
├── docs/                        Documentación del proyecto
│
├── backend/
│   ├── src/
│   │   ├── config/database.js   Conexión a la base de datos
│   │   ├── models/               Definición de las tablas (Sequelize)
│   │   ├── controllers/          Lógica de cada funcionalidad
│   │   ├── routes/               URLs de la API y a qué controlador llaman
│   │   ├── middleware/auth.js    Verifica el token del admin
│   │   ├── seed.js               Datos de ejemplo
│   │   └── server.js             Arranca el servidor Express
│   └── .env                      Configuración (puerto, clave secreta)
│
└── frontend/
    └── src/
        ├── api/client.js         Conexión con el backend
        ├── context/AuthContext.jsx  Sesión del administrador
        ├── components/           Navbar, protección de rutas
        ├── pages/cliente/         Home, Reservar, Cancelar
        ├── pages/admin/           Login, Citas, Servicios, Profesionales
        ├── styles/index.css       Diseño visual (colores, tipografía)
        └── App.jsx                Define las URLs (rutas) de la app
```

## 4. Flujo de una reserva (cliente)

1. El cliente entra a `/` y ve los servicios (`GET /api/servicios`).
2. Elige "Reservar" → entra a `/reservar` con el servicio preseleccionado.
3. Elige profesional (`GET /api/profesionales`).
4. Elige una fecha → el frontend pide las horas libres (`GET /api/citas/disponibilidad`), que el backend calcula cruzando el horario de trabajo del profesional con las citas ya existentes ese día.
5. Completa sus datos y confirma → `POST /api/citas`. El backend vuelve a verificar que el horario siga libre (por si alguien más lo tomó mientras tanto) antes de guardarlo.

## 5. Flujo del administrador

1. Inicia sesión en `/admin/login` → `POST /api/auth/login` devuelve un token.
2. Ese token se guarda en el navegador y se envía automáticamente en cada petición a rutas protegidas (interceptor en `frontend/src/api/client.js`).
3. Desde el panel puede: ver y filtrar citas, cambiar su estado, crear/editar/eliminar servicios y profesionales, y definir los horarios de cada profesional.
