# Contrato candidato de consulta interna psicosocial

Estado: borrador para R01, R04, R07, R11, R12 y R14. La Universidad de Manizales custodia la base. Solo el Equipo de Apoyo Psicosocial autorizado de la Universidad consulta registros individuales. Las operaciones se proponen para revisión y siguen sin implementar.

## Qué representa cada registro

Un caso es un identificador interno candidato para organizar el seguimiento de una persona evaluada. Una aplicación IBITE representa una evaluación versionada de esa persona. Una aplicación puede tener varios resultados de puntuación cuando se reprocesa. Un registro de atención documenta un evento verificable y una recomendación identifica una orientación derivada o propuesta. Confirmar si se organiza un caso por persona, por episodio o por campaña antes de crear la clave persistente.

El sistema debe poder mostrar el contexto de institución, campaña, instrumento y periodo, y distinguir la procedencia de un resultado de origen y de un resultado recalculado. Los textos de orientación, la criticidad y las rutas permanecen vinculados a la regla aplicada y a la aprobación metodológica. El catálogo de estados de seguimiento, sus transiciones y la definición de atención corresponden al protocolo operativo por aprobar.

## Operaciones candidatas

| Método y ruta | Acción y ámbito | Entrada | Salida |
|---|---|---|---|
| GET /api/v1/interno/casos | Listar casos para seguimiento autorizado | Institución, periodo, instrumento, estado operativo si existe, cursor y límite. Cada filtro se valida en servidor | 200. Referencia opaca, institución, periodo, resumen operativo y cursor. Propuesta de omitir identificadores nominales del listado general |
| GET /api/v1/interno/casos/{casoId} | Consultar contexto individual | Identificador opaco | 200. Contexto del caso, aplicaciones relacionadas y actividades registradas, con procedencia y fecha. Los identificadores nominales requieren la acción específica definida abajo |
| GET /api/v1/interno/casos/{casoId}/identificacion | Consultar datos nominales bajo custodia | Identificador opaco | 200. Solo los campos nominales necesarios para la finalidad operativa aprobada. Consulta auditada |
| GET /api/v1/interno/aplicaciones-ibite/{aplicacionId}/resultados | Consultar resultados reproducibles de una aplicación | Identificador opaco, cursor si hay múltiples resultados | 200. Versión del instrumento, versión de regla, criterios de completitud, origen, fecha y resultados versionados |
| POST /api/v1/interno/exportaciones | Solicitar exportación de un tipo y finalidad aprobados | Tipo de reporte, filtros permitidos y finalidad, con validación de ámbito | 202 si se genera de forma diferida. La operación de descarga y la vigencia del archivo se cierran por formato y modalidad aprobados |

Propuesta de errores: 400 para filtros mal formados, 401 para sesión ausente, 403 cuando la cuenta no pertenece al equipo autorizado o carece de la acción requerida y 404 para objetos inexistentes o fuera de ámbito. Usar 422 si una exportación solicita una combinación incompatible con la finalidad o el tipo aprobado.

## Autorización y auditoría

- Verificar pertenencia al equipo autorizado, permiso para la acción y ámbito efectivo antes de acceder a datos. La cobertura se limita a instituciones explícitamente asignadas y se consulta en servidor, incluso con sesiones ya emitidas.
- Tratar lectura de expedientes, consulta nominal y exportación como acciones identificables aunque inicialmente correspondan al mismo equipo. El identificador opaco reduce exposición en URLs y se comprueba con autorización por objeto.
- Registrar actor, hora, acción, objeto opaco, ámbito, finalidad cuando aplique y resultado. Evitar nombres, documentos, teléfonos, texto clínico, respuestas y credenciales en eventos y trazas. El acceso a los eventos de auditoría también se controla.
- Proteger las respuestas internas de almacenamiento en caché compartida. Limitar y auditar exportaciones que incluyan identificadores. Acordar caducidad, eliminación y acceso de descarga según política de la Universidad.
- Las recomendaciones de la Matriz Piloto y las alertas calculadas no incrementan conteos de atención por sí solas. La estadística de seguimiento utiliza eventos de atención registrados conforme a la definición aprobada.

## Criterios de aceptación propuestos

| ID | Verificación |
|---|---|
| PSI-01 | La sesión de un integrante autorizado consulta listado, caso y resultados, y obtiene los campos nominales solo a través de la operación definida para ese propósito |
| PSI-02 | Una sesión de participante, un visitante sin sesión o una cuenta revocada no recuperan detalle ni identificación aunque conozcan un ID válido |
| PSI-03 | La respuesta permite distinguir resultados históricos y recalculados mediante versión y procedencia |
| PSI-04 | Una recomendación sin evento de atención no aumenta el conteo de atención realizada |
| PSI-05 | El acceso nominal y la exportación dejan eventos auditables con referencias opacas y sin datos nominales en los registros de auditoría |
| PSI-06 | Un filtro, tipo o ámbito de exportación fuera de la autorización se rechaza y la descarga revalida permisos |

Decisiones pendientes para cierre: significado y cardinalidad de caso, campos nominales necesarios para cada finalidad, reglas de seguimiento y corrección, formatos de exportación y política institucional de conservación. Ver [permisos y custodia](../07-seguridad/permisos-custodia.md) y [Matriz Piloto](../06-reglas-negocio/matriz-resultados.md).

El [contrato de resultados](ibite-resultados.md) describe el subconjunto implementado; las demás operaciones siguen en borrador.
