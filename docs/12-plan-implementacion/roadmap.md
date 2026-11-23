# Roadmap y backlog inicial

## Fin de semana del 21 y 22 de noviembre de 2026

Sábado: confirmar alcance plataforma/piloto, fuentes vigentes, custodia, catálogo y acceso; estudiar versiones IBITE y perfilar muestras autorizadas. Entregables: inventario validado, conflictos resueltos o asignados, alcance MVP y criterios revisados.

Domingo: con aprobación del paso de fase, cerrar ADR, especificar identidad y catálogos, revisar modelo y diseñar el primer contrato. Si los insumos y la especificación están cerrados con tiempo, intentar un incremento pequeño de base técnica, verificado en entorno aislado. La entrega comprometible es el paquete de especificaciones revisable; la fecha de un backend IBITE funcional depende de los insumos y la validación.

## Incrementos priorizados

| Tarea / épica | Objetivo o historia | Requisitos y dependencias | Módulo o archivos | Aceptación y pruebas | Estado y bloqueo |
|---|---|---|---|---|---|
| T00 / Descubrimiento | Como equipo, determinar alcance y fuentes | R01–R14, PM y PP | docs, AGENTS, README, CHANGELOG | Matriz, inventario, modelo, ADR y enlaces verificables | Entregado para revisión; falta validar fuentes y decisiones |
| T01 / MVP base | Como mantenedor, arrancar y verificar entornos reproducibles | R12, R13, ADR-01 y aprobación de fase | configuración, CI, docs, contratos | Entorno aislado, configuración inválida rechazada; pruebas de arranque y migración | Pendiente de aprobación y compatibilidad |
| T02 / MVP identidad | Como usuario habilitado, acceder a mi ámbito | R01, R12, T01, I04, I05, ADR-02 y ADR-04 | identidad, catálogos, auditoría | Alta, autenticación y revocación verificadas; E2E por rol, ámbito y abuso | Pendiente de matriz y custodia |
| T03 / MVP IBITE | Como participante, enviar una aplicación autorizada | R02, T02, I01, ADR-05 | IBITE, contratos, persistencia | Flujo por versión y campaña; pruebas de validación, reintentos e integridad | Pendiente de instrumento y reglas |
| T04 / Histórico | Como custodio, importar y conciliar una fuente | R03, T03, I03 | importaciones, IBITE | Reconciliación por estado; pruebas de repetición y reversión transaccional | Pendiente de mapeo y acceso |
| T05 / Metodología y analítica | Como profesional autorizado, consultar resultados reproducibles | R04, R09, T03, I02, I11; T04 para histórico | puntuación, analítica | Casos de referencia, faltantes y privacidad de agregados probados | Bloqueo metodológico |
| T06 / Segunda etapa | Como equipo psicosocial, registrar implementación y seguimiento | R05–R08, R14, T02, I06–I09, I12 | MTTS, factibilidad, matriz, fichas e intervenciones | Incremento por formulario o flujo con pruebas de validación y permisos | Pendiente de documentos |
| T07 / SIG | Como analista, consultar capas y geometrías autorizadas | R10, T02, I10, ADR-03 | catálogo espacial, importación SIG | GeoJSON y CRS verificados, pruebas de filtro, validez e índice | Pendiente de fuentes, licencia y prueba técnica |
| T08 / Reportes | Como usuario autorizado, descargar un resultado aprobado | R11, I13 y fuente verificada por reporte | exportaciones y auditoría | Pruebas de formato, ámbito y registro | Pendiente de audiencia y formato |
| T09 / Angular | Como usuario, operar formularios, tablero y mapa | R02, R05–R11 según pantalla; autorización expresa y contratos estables | frontend | Flujos integrados verificados contra API | Reservado para autorización futura |

El MVP propuesto termina con identidad, catálogos y captura IBITE. El histórico puede incorporarse al corte si el mapeo y custodia se validan a tiempo. Para reportes, decidir CSV o XLSX según necesidad tabular, PDF para presentación fija o GeoJSON para intercambio espacial, por solicitud concreta.

El [corte de preparación del MVP](corte-mvp.md) actualiza la secuencia a partir de las decisiones de custodia, variantes y acceso público, y distingue las condiciones de cada incremento.
