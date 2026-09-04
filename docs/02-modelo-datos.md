# BeautyCare — Modelo de Datos

## 1. Entidades principales

### Admin
Usuario con acceso al panel de administración.
| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK) | Identificador |
| email | String (único) | Correo de acceso |
| password | String | Hash de la contraseña |
| nombre | String | Nombre del administrador |

### Cliente
Persona que agenda citas (no requiere login).
| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK) | Identificador |
| nombre | String | Nombre completo |
| telefono | String | Teléfono de contacto |
| email | String | Correo (opcional) |

### Servicio
Servicios ofrecidos (manicura, tratamiento facial, etc.)
| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK) | Identificador |
| nombre | String | Nombre del servicio |
| descripcion | String | Detalle del servicio |
| precio | Float | Precio en la moneda local |
| duracionMinutos | Int | Duración estimada |

### Profesional
Personas que prestan los servicios.
| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK) | Identificador |
| nombre | String | Nombre del profesional |
| especialidad | String | Especialidad principal |
| activo | Boolean | Si sigue trabajando en el negocio |

### Horario (disponibilidad semanal de un profesional)
| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK) | Identificador |
| profesionalId | Int (FK) | Profesional al que pertenece |
| diaSemana | Int | 0=Domingo … 6=Sábado |
| horaInicio | String | Ej: "08:00" |
| horaFin | String | Ej: "17:00" |

### Cita
Reserva concreta hecha por un cliente.
| Campo | Tipo | Descripción |
|---|---|---|
| id | Int (PK) | Identificador |
| clienteId | Int (FK) | Cliente que reserva |
| profesionalId | Int (FK) | Profesional asignado |
| servicioId | Int (FK) | Servicio solicitado |
| fecha | DateTime | Fecha y hora de la cita |
| estado | String | pendiente / confirmada / cancelada / completada |

## 2. Relaciones
- Un **Profesional** tiene muchos **Horarios** (1 a N).
- Un **Profesional** puede tener muchas **Citas** (1 a N).
- Un **Servicio** puede estar en muchas **Citas** (1 a N).
- Un **Cliente** puede tener muchas **Citas** (1 a N).

## 3. Diagrama (texto)

```
Cliente 1---N Cita N---1 Profesional 1---N Horario
                Cita N---1 Servicio
```

Este modelo se implementó usando **Sequelize ORM** sobre **SQLite** (desarrollo, archivo `database.sqlite`), migrable a PostgreSQL en producción cambiando el `dialect` en `src/config/database.js` sin tocar el resto del código.
