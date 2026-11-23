# Matriz inicial de permisos y custodia

R01, R02, R09 y R12. Decisiones confirmadas por el usuario y propuesta de condiciones para cerrar contratos.

## Decisiones confirmadas

| Perfil o audiencia | Acción confirmada | Alcance |
|---|---|---|
| Estudiante | Completar IBITE | Única operación interna del perfil. Aplicación habilitada y variante compatible con las reglas del instrumento |
| Acudiente | Completar IBITE | Única operación interna del perfil. La rama A del libro corresponde al cuidador de un menor de 5–10 años. Pendiente mecanismo de habilitación |
| Orientador | Completar IBITE | Única operación interna del perfil. Variante IBITE-DA-28 confirmada |
| Docente | Completar IBITE | Única operación interna del perfil. Variante IBITE-DA-28 confirmada |
| Administrativo y Directivo | Completar IBITE-DA-28 | Variante confirmada. Permiso interno de responder |
| Equipo de Apoyo Psicosocial | Acceder a toda la información del sistema | Acceso y operaciones amplias confirmados para la etapa inicial, con restricciones adicionales previstas. Cobertura limitada a las instituciones que tenga asignadas explícitamente. La consulta de registros individuales se reserva a integrantes autorizados del equipo de la Universidad de Manizales |
| Público, con o sin cuenta | Consultar el dashboard mediante su URL | Sin inicio de sesión. La consulta se limita a indicadores aprobados para publicación. Poseer la URL no otorga permisos sobre operaciones internas |

Completar IBITE comprende obtener el formulario habilitado y enviar las respuestas. Confirmar si pueden guardar borradores, retomar o corregir envíos. La validación por rama, periodo y pertenencia se aplica en servidor. El rol por sí solo no concede acceso a otras respuestas, casos, fichas ni exportaciones. Orientador y Equipo de Apoyo Psicosocial se mantienen como perfiles distintos. Si una persona cumple ambas funciones, se debe aprobar cómo se asignan y controlan sus permisos.

## Permisos operativos y custodia

- Equipo de Apoyo Psicosocial: se confirman para la etapa inicial creación, corrección y aprobación de registros, importación, exportación, ajuste o eliminación de registros y consulta de auditoría. Especificar reglas, trazabilidad y conservación de cada operación.
- Confirmar quién crea y revoca cuentas, asigna permisos, habilita campañas y aprueba la publicación. El prompt contempla perfiles adicionales. Sus atribuciones concretas quedan pendientes.
- Docente, Orientador y Administrativo usan IBITE-DA-28. Especificar sus reglas por separado. El Excel -23 sigue siendo la referencia de puntuación para cuidador y adolescente.
- La Universidad de Manizales es el custodio confirmado. La base de datos institucional alojará los datos del proyecto, incluidos los identificadores nominales y sus vínculos con las respuestas. Únicamente integrantes autorizados del Equipo de Apoyo Psicosocial de la Universidad podrán consultar registros individuales. Queda por definir quién administra esos vínculos, dónde se aloja la infraestructura y cómo se gestionan conservación, archivos originales, respaldos y accesos técnicos.
- Validar quién diligencia MTTS Formato A y Factibilidad según cada instrumento. El rol declarado en un formulario no asigna privilegios de cuenta.

## Dashboard público

Propuesta de contrato: exponer un conjunto aprobado de métricas agregadas con filtros explícitos y respuestas acotadas a agregados. Antes de publicar por institución, sede, periodo o mapa, validar un umbral de divulgación y reglas para cruces que permitan inferir cifras mediante diferencias. Mantener en el circuito restringido los casos priorizados individuales, los identificadores y los expedientes. Documentar audiencia, fuente y decisión de publicación por indicador. Si existe una vista operativa con datos individuales, su acceso sigue las reglas del equipo autorizado.

| ID de aceptación | Caso |
|---|---|
| ACC-01 | Cada uno de los cuatro perfiles de respuesta obtiene y envía su IBITE habilitado. El servidor rechaza el acceso a respuestas de terceros y módulos internos |
| ACC-02 | El Equipo de Apoyo Psicosocial consulta información autorizada. Se prueba la delimitación territorial cuando se apruebe y se comprueba la revocación de acceso |
| ACC-03 | El visitante sin sesión consulta métricas públicas y recibe rechazo al intentar consultar registros internos |
| ACC-04 | Celdas pequeñas, cruces de filtros y comparaciones entre respuestas públicas cumplen la política aprobada de divulgación |
| ACC-05 | Las operaciones pendientes sobre alta, exportación, edición e importación quedan denegadas por defecto hasta la asignación aprobada |

El [contrato candidato del dashboard público](../05-contratos-api/dashboard-publico.md) define filtros, revisión de inferencia y criterios de aceptación para publicación.

Los roles y permisos de alcance inicial están versionados en la [especificación del catálogo de acceso](../04-modelo-datos/identidad-catalogos.md). La semilla no asigna roles a personas ni aplica autorización en rutas.

Está disponible el [contrato de sesión interna](../05-contratos-api/sesion-interna.md). La emisión de credenciales y los permisos por objeto permanecen pendientes para las operaciones de negocio.

Asignación institucional explícita obligatoria para los recursos psicosociales. Los roles técnicos quedan excluidos de la consulta individual. Consulta implementada: [resultados IBITE](../05-contratos-api/ibite-resultados.md). Gestión auditada de asignaciones pendiente.

El permiso imports:review existe en el catálogo sin asignación automática. Gestionar importaciones no implica revisar incidencias ni aprobar su publicación.

El Equipo de Apoyo Psicosocial con audit:read puede consultar la [auditoría reciente de sus instituciones](../05-contratos-api/auditoria-institucional.md). La lectura queda auditada.
