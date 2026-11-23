# Especificación de alertas automáticas MTTS Formato A

**Versión documental:** 1.0. **Estado:** reglas documentadas para revisión del comité. Derivadas del anexo «Protocolo de interpretación y generación de alertas de implementación» del documento Instrumentos IBITE Implementación. R05. Esta especificación cubre detección, clasificación y registro de alertas de implementación. Las rutas clínicas y de protección conservan sus procedimientos y tiempos vigentes.

## Reglas por nivel

| ID | Nivel | Disparador | Acción prevista en el anexo |
|---|---|---|---|
| MTTS-AL-01 | Roja | Evidencia o reporte estructurado de incumplimiento o sospecha de incumplimiento de respuesta de seguridad, riesgo sin ruta, vulneración de confidencialidad, caso urgente sin responsable o imposibilidad de ejecutar un paso esencial de protección. | Atención inmediata por liderazgo clínico y coordinación, activación del protocolo vigente, registro restringido y verificación del enlace. |
| MTTS-AL-02 | Naranja | Fidelidad o seguridad con valor 1 o 2. También evidencia de omisión de un paso esencial sin daño inmediato identificado o derivaciones sistemáticamente sin confirmación de acceso. | Revisar el proceso en 24 horas hábiles, asignar responsable y corrección, y verificar la ejecución en 48–72 horas según el protocolo. |
| MTTS-AL-03 | Amarilla | Aceptabilidad, adecuación, factibilidad, adopción, coordinación o calidad del registro con valor 1 o 2 en una semana. También valor 3 en la misma dimensión durante dos semanas consecutivas, o barrera repetida en dos cortes. | Tratar en el próximo encuentro de coordinación, idealmente dentro de cinco días hábiles. Acordar un ajuste con fecha y revisarlo en el siguiente corte. |
| MTTS-AL-04 | Verde | Valoraciones de 4 o 5 y ausencia verificada de incumplimientos objetivos o incidentes abiertos. | Mantener el seguimiento semanal. Registrar facilitadores que puedan reutilizarse. |

La clasificación toma el nivel más grave disparado y conserva los motivos concurrentes. Un 1 o 2 en seguridad sigue la regla naranja de percepción. Una evidencia roja independiente tiene precedencia incluso con valoraciones favorables.

## Entradas y tratamiento de faltantes

- **Ficha semanal:** aporta sede, autor, intervalo, las ocho valoraciones, barreras y el escalamiento indicado por quien diligencia.
- **Evidencia operativa:** proviene del tablero, la revisión de registros o un reporte profesional autorizado con campos estructurados. Una anotación libre o el indicador genérico de escalamiento no basta por sí solo para inferir un incidente rojo. Las condiciones operativas se dejan pendientes cuando no se cuenta con evidencia.
- **NA y ausencia:** se conservan por separado. Ninguna cuenta como 4 o 5 ni como señal 1–2. Si no hay otro disparador y falta evidencia para verde, la evaluación queda **sin clasificación suficiente**. Este estado técnico se propone para evitar un verde por defecto.
- **Seguimiento temporal propuesto:** comparar la misma dimensión o el mismo código de barrera para el mismo profesional e institución/sede. Dos semanas consecutivas requieren fechas de inicio separadas por siete días. Una semana intermedia faltante corta la secuencia. Confirmar si la regla de barreras compara dos cortes consecutivos y cómo consolidar entre profesionales.

## Registro y ciclo de vida propuestos

Cada evaluación conserva la versión de reglas, los motivos, fuente, fecha, institución/sede y semana. Una alerta accionable añade responsable, plazo, acción correctiva y evidencia mínima sin datos identificables de estudiantes. Estados para seguimiento: abierta, en seguimiento y cerrada. Cerrar exige registrar la comprobación. Volver a evaluar el mismo evento o ficha y versión no crea duplicados. El registro de alertas y los envíos de notificaciones se implementan como operaciones separadas.

Faltan confirmar la definición operativa de «sistemáticamente», los responsables y canales, y la regla de agrupación temporal. Las alertas rojas nunca deben esperar a un cierre semanal. Los plazos expresados arriba se subordinan al procedimiento aprobado cuando exista una discrepancia.

## Casos de aceptación con datos sintéticos

| Caso | Entrada | Resultado esperado |
|---|---|---|
| MTTS-AL-T01 | Seguridad = 2, sin evidencia roja | Naranja por seguridad |
| MTTS-AL-T02 | Todas las valoraciones = 5, con vulneración de confidencialidad confirmada | Roja por evidencia objetiva |
| MTTS-AL-T03 | Fidelidad = 2 y aceptabilidad = 1 | Naranja, con ambos motivos |
| MTTS-AL-T04 | Factibilidad = 1 durante una semana | Amarilla |
| MTTS-AL-T05 | Coordinación = 3 en dos semanas consecutivas y en el mismo ámbito | Amarilla según la unidad temporal propuesta |
| MTTS-AL-T06 | Coordinación = 3 en dos registros separados por una semana faltante | Sin disparador por recurrencia |
| MTTS-AL-T07 | Una dimensión NA y otra faltante, sin evidencia de incidentes | Sin clasificación suficiente si no hay otro disparador |
| MTTS-AL-T08 | Todas las dimensiones entre 4 y 5 y revisión operativa sin incidentes ni incumplimientos | Verde |
| MTTS-AL-T09 | Se reprocesa la misma ficha y versión | Mismo resultado sin duplicar la alerta |

No se requieren fichas reales para estas comprobaciones. Los casos son de aceptación para el futuro motor y aún no se ejecutaron. Esta etapa cambia solo documentación.
