# Reporte nocturno de desarrollo

**Fecha:** 20 de noviembre de 2026, Colombia. **Proyecto:** SIG-LUKER.

## 1. Resumen general

Se completaron cinco incrementos verificables. Los motores internos IBITE-17 e IBITE-DA-28 calculan dimensiones, clasifican perfiles y riesgos, y reproducen la selección técnica de orientación. El cálculo puede invocarse con una referencia versionada leída del catálogo. PostgreSQL tiene una comprobación de disponibilidad independiente de la salud del proceso.

## 2. Funcionalidades terminadas

- Selectores internos de acción, plazo, ruta, señales y clave de recomendación para ambos Excel. Se preservó la precedencia de seguridad ante registros incompletos y las diferencias entre el plazo y el indicador general.
- Catálogo Prisma con dos instrumentos y tres variantes: cuidador, adolescente y personal educativo. La semilla es repetible, conserva la huella SHA-256 y rechaza discrepancias en metadatos de versiones existentes.
- Punto interno de entrada para reproducir el cálculo por instrumento, variante y versión. Devuelve la referencia utilizada y rechaza una combinación incompatible.
- Consulta técnica de PostgreSQL por GET /api/v1/ready, descrita en OpenAPI y Postman.
- Prueba de instalación limpia: migraciones, semilla y batería de integración sobre una segunda base sintética desechable.

## 3. Funcionalidades parciales

- **Puntuación.** Las orientaciones calculadas son códigos técnicos. Los mensajes, infografías, rutas operativas y el tratamiento clínico de faltantes requieren validación. El cálculo todavía no se expone por HTTP ni guarda resultados.
- **Captura y autenticación.** Sesiones y permisos base operativos. Faltan la habilitación de participantes, el canal de credenciales y las decisiones de elegibilidad, obligatoriedad y corrección para exponer el envío.
- **Analítica y seguimiento.** Los contratos de histórico, dashboard y consulta de casos siguen como borradores. El catálogo técnico no habilita formularios ni publicaciones.

## 4. Pruebas ejecutadas

- **22 pruebas automatizadas aprobadas** en el entorno aislado habitual y **22 aprobadas** al repetir la batería en una base desechable recién migrada. Incluyen NestJS, sesiones, permisos, catálogo, orientación y disponibilidad.
- **27 comprobaciones Excel aprobadas** en nueve casos adicionales con datos y etiquetas sintéticas, para plazos y claves de recomendación e infografía.
- ESLint, Prettier, auditoría npm y comparación Prisma entre esquema y base aprobados. Las comprobaciones SQL de integridad y PostGIS terminaron con ROLLBACK.

## 5. Problemas y pendientes

- INC-IBITE-01 e INC-IBITE-02 siguen abiertas y afectan la asociación de resultados históricos.
- El directorio de trabajo no tiene metadatos Git. No se realizaron commits.
- El uso de datos reales está condicionado a validar la unidad de respuesta, el vínculo del acudiente, el contexto institucional y las condiciones de consentimiento, acceso y conservación.
- La publicación pública requiere definir métricas, denominadores, cortes, filtros y política de divulgación. La consulta individual de resultados requiere definir la aplicación y el alcance por objeto.
- Se ajustó un punto de inserción de las pruebas tras comprobar que Prettier había partido la línea original. La ejecución posterior terminó sin fallos.

## 6. Estado de base de datos y endpoints

PostgreSQL 17.12 y PostGIS 3.7.0 en sig_test, puerto local 55433. Prisma 7.10.1 registra tres migraciones aplicadas. La base desechable de verificación en el puerto 55434 se cerró al terminar. No se accedió a producción, no se migraron bases reales y no se guardaron respuestas ni resultados.

| Acceso | Rutas operativas |
|---|---|
| Técnico | GET /api/v1/health; GET /api/v1/ready con PostgreSQL configurado |
| Sesión vigente | GET /api/v1/auth/me; DELETE /api/v1/auth/session |
| Lectura interna autorizada | GET /api/v1/interno/catalogos/instituciones; GET /api/v1/interno/catalogos/periodos |
| Documentación habilitable | GET /docs; GET /docs-json |

## 7. Prioridades para retomar

1. Cerrar unidad de respuesta, reglas de habilitación, vínculo del acudiente y formulario completo por variante. Con ello se puede implementar captura con datos sintéticos y autorización por aplicación.
2. Aprobar persistencia versionada de resultados ligada a aplicaciones, privilegios por objeto y auditoría, preservando la procedencia de las evaluaciones.
3. Validar el tratamiento de señales de seguridad ante faltantes y los contenidos de orientación antes de su activación.
4. Conciliar las incidencias históricas y aprobar la clave entre exportaciones antes de importar datos reales.
5. Cerrar definiciones y política de divulgación antes del primer corte del dashboard público.

Toda implementación registrada en esta sesión tiene aceptación comprobada. Los pasos siguientes que cambian el comportamiento de negocio dependen de las decisiones anteriores.

[Progreso cronológico](PROGRESO_DESARROLLO.md) · [Pendientes](PENDIENTES.md) · [Decisiones técnicas](11-decisiones-tecnicas/adr-iniciales.md) · [Pruebas](08-pruebas/entorno-datos.md)

## Actualización del 21 de noviembre de 2026

**Decisiones incorporadas.** Periodicidad semestral, una definitiva por persona/instrumento/periodo, directivos en IBITE-DA, acudientes con vínculo verificable, custodia y acceso individual estrictamente asignado, señales preservadas ante faltantes y distinción entre dashboard público y privado. La próxima jornada tentativa debe configurarse. [Detalle y trazabilidad](02-requerimientos/decisiones-2026-11-21.md).

**Implementado.** La cuarta migración agrega Participant, IbiteApplication, IbiteResult y ProfessionalInstitution. La consulta GET /api/v1/interno/aplicaciones-ibite/{aplicacionId}/resultados se protege mediante rol, permiso y asignación institucional. OpenAPI y Postman incluyen la ruta. El cálculo interno conserva señales positivas y faltantes por separado sin cambiar la reproducción Excel ni emitir avisos.

**Pruebas y entorno.** 24 pruebas aprobadas, ESLint y Prettier aprobados. Prisma aplicó la migración en sig_test y no detectó diferencias. Se usaron datos sintéticos. En el Excel -23 se revisaron encabezados y agregados de fechas y alias en solo lectura. No se importaron registros reales, no se publicaron estadísticas y no se hicieron despliegues.

**Pendientes principales.** 1. Validar formularios completos, vinculación, consentimiento y ventanas para la captura. 2. Completar escritura, historial y gestión auditada de asignaciones, antes de dar acceso a resultados reales. 3. Conciliar referencias y cobertura de alias del histórico. El dashboard real y las notificaciones requieren política y protocolos aprobados.

## Incremento de captura y conciliación

Operativas la persistencia interna, la auditoría de finalización y lectura de resultados, y las altas/bajas auditadas de ámbito. Las rutas de formulario y envío requieren configuración original y reglas verificadas. Las 24 pruebas pasaron. La conciliación 7.554/7.557 identificó tres referencias vacías y generó una tabla local de revisión institucional. Dashboard público sin datos reales y notificaciones desactivadas.

**Avance adicional.** Aplicada en sig_test la sexta migración de campañas y habilitaciones. La finalización interna deriva institución, periodo, variante y participante desde la habilitación y revalida permiso, titularidad, revocación y ventana. 24 pruebas aprobadas. Captura HTTP pendiente de formularios y consentimiento.

Añadida y probada la consulta paginada de habilitaciones propias por HTTP. El formulario completo y el envío público continúan pendientes de las validaciones de captura.

El diagnóstico histórico interno reproduce los conteos de Manizales y separa orígenes vacíos, referencias repetidas y alias ambiguos. La batería aumentó a 27 pruebas aprobadas. No hubo escritura histórica ni cambios de esquema.

El extractor local de Manizales -23 generó un resumen reproducible con tres referencias vacías y 4.848 respuestas para revisión institucional. No se expusieron rutas de carga ni se publicaron registros.

El perfil DA-28 verificó 630 respuestas, 1.953 cálculos y 1.323 cálculos con origen vacío. La referencia duplicada 1228 no tiene respuesta en la copia revisada. No se escribieron registros ni se aprobaron equivalencias.

Se aplicó la séptima migración en sig_test para diagnósticos y revisiones históricas auditadas. Se verificaron idempotencia simultánea, permisos separados y conservación de la instantánea, sin registrar datos reales ni publicar lotes.

La auditoría institucional ya tiene una ruta restringida con OpenAPI y Postman. La octava migración agregó un índice de consulta. Se verificó aislamiento y revocación en PostgreSQL con la batería de 28 pruebas.

El lote incorporó detalle y acuse propios, idempotencia interna, desafío Bearer y sugerencias ortográficas para revisión institucional. La instalación limpia de nueve migraciones y las pruebas finales se detallan en [REPORTE_SESION_AUTONOMA.md](REPORTE_SESION_AUTONOMA.md).

El tercer lote autónomo completó cinco tareas. 36 pruebas Node y 5 Python pasaron; el script nuevo validó instalación limpia, migraciones y PostGIS. Ver [reporte de sesión](REPORTE_SESION_AUTONOMA.md).
