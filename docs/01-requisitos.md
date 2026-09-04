# BeautyCare — Documento de Requisitos

## 1. Descripción general
BeautyCare es un sistema de gestión de citas para un negocio de manicura y cuidado de la piel.
Consta de dos partes:
- **Cliente (web pública)**: consultar servicios, precios, duración, profesionales, horarios disponibles y reservar/cancelar citas.
- **Administrador (panel privado)**: gestionar servicios, profesionales, horarios y citas.

## 2. Actores del sistema
| Actor | Descripción |
|---|---|
| Cliente | Persona que navega el sitio, agenda o cancela citas. No requiere rol administrativo. |
| Administrador | Usuario con acceso al panel de gestión (login requerido). |

## 3. Requisitos funcionales

### 3.1 Módulo Cliente
- RF-01: El cliente puede ver la lista de servicios con nombre, descripción, precio y duración.
- RF-02: El cliente puede ver la lista de profesionales disponibles.
- RF-03: El cliente puede consultar los horarios disponibles de un profesional para un servicio.
- RF-04: El cliente puede reservar una cita indicando servicio, profesional, fecha y hora.
- RF-05: El cliente puede cancelar una cita existente.
- RF-06: El sistema debe evitar reservas duplicadas (mismo profesional, misma fecha/hora).
- RF-07: El cliente proporciona nombre, teléfono y correo al reservar (no requiere cuenta).

### 3.2 Módulo Administrador
- RF-08: El administrador inicia sesión con correo y contraseña.
- RF-09: El administrador puede crear, editar y eliminar servicios.
- RF-10: El administrador puede crear, editar y eliminar profesionales.
- RF-11: El administrador puede definir los horarios de trabajo de cada profesional (día y rango horario).
- RF-12: El administrador puede ver todas las citas agendadas, filtrando por fecha, profesional o estado.
- RF-13: El administrador puede cambiar el estado de una cita (pendiente, confirmada, cancelada, completada).

## 4. Requisitos no funcionales
- RNF-01: Interfaz web responsiva (accesible desde celular y computador).
- RNF-02: Tiempo de respuesta menor a 2 segundos en operaciones normales.
- RNF-03: Los datos deben persistir en una base de datos relacional.
- RNF-04: Las contraseñas de administrador se almacenan cifradas (hash).
- RNF-05: El sistema debe validar que no se agenden citas en horarios ya ocupados.

## 5. Alcance de la primera versión (MVP)
- CRUD completo de servicios, profesionales y horarios (admin).
- Flujo de reserva y cancelación de citas (cliente).
- Autenticación simple del administrador.
- Sin pagos en línea (versión futura).
- Sin notificaciones por correo/SMS (versión futura).
