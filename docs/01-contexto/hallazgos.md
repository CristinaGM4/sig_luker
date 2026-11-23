# Registro de hallazgos y decisiones pendientes

Este registro reúne observaciones verificadas, confirmaciones de alcance y decisiones pendientes. Los documentos de cada módulo conservan su evidencia y criterios de aceptación.

| ID | Requisito | Hallazgo y evidencia | Estado y acción |
|---|---|---|---|
| H-01 | R02–R04, R09, R14 | El PDF del piloto cita 7.345 estudiantes de 48 instituciones, plantea retamizaje focalizado y describe un tablero existente. El prompt estima unos 8.000 registros y plantea aplicación semestral en una plataforma nueva | Pendiente. Conciliar unidades de conteo, cohortes, alcance e integración con Censo Digital |
| H-02 | R04 | El usuario confirmó el Excel IBITE Manizales (respuestas)-23.xlsx como referencia de puntuación. Se registró su huella | Confirmado. Mantener trazabilidad a la versión |
| H-03 | R04 | AO devuelve Sin datos cuando falta un ítem de seguridad aunque el otro activaría una alerta si ambos estuvieran presentes | Verificado en Excel. El equipo psicosocial debe definir el tratamiento operativo antes de activar alertas |
| H-04 | R04 | En un cuestionario incompleto, BA puede devolver Sin datos suficientes mientras BB y BC indican valoración el mismo día | Verificado en Excel. Validar cómo se presentan y usan ambas salidas |
| H-05 | R04 | La comparación de recursos de AZ permite asignar perfil 5 con un dominio bajo y el otro faltante. AY admite hasta dos ítems faltantes y cuenta el 9 como valor numérico de seguridad | Verificado en la especificación y pruebas de referencia. Revisar el tratamiento operativo de faltantes |
| H-06 | R03, R04 | INC-IBITE-01. Los 17 ítems de Puntuaciones R7558:AH7558 leen la fila 7560 del formulario. Las 17 diferencias están concentradas en esa fila | Abierto. Confirmar el vínculo con la persona responsable de la exportación y probar el tratamiento aprobado |
| H-07 | R04 | 54 comprobaciones desde ítems codificados y 30 desde opciones sintéticas pasaron en Excel. BF/BG se probaron con etiquetas sintéticas | Verificado en el alcance ensayado. Sigue pendiente revisar textos, rutas y vigencia de la orientación |
| H-08 | R01, R12 | El usuario indicó que aún no existe matriz de permisos y custodia | Abierto. Preparar propuesta y validarla antes de operar con datos sensibles reales |
| H-09 | R05 | Solo entra el Formato A. El Word lo ubica en el piloto MTSS y el proyecto lo denomina MTTS | Alcance confirmado. Confirmar denominación y mantener trazabilidad al Word |
| H-10 | R05 | El Word indica una ficha semanal por institución/sede. Los flujos de consolidación, corrección y manejo de una ficha institucional sin sede requieren definición | Abierto. Resolver antes de cerrar unicidad y contrato |
| H-11 | R05 | El anexo del Word presenta alertas de implementación como propuestas sujetas a aprobación | Abierto. La primera captura puede especificarse mientras el comité decide |
| H-12 | R06 | El usuario identifica las capturas como Factibilidad. El encabezado del formulario dice Evaluación de la fidelidad de implementación y refiere al taller Jugar para cuidar | Abierto. Confirmar denominación visible y alcance por taller |
| H-13 | R06 | Las capturas muestran una cuadrícula de cinco niveles con enunciados truncados y el final de otra cuadrícula con tres opciones | Parcial. Conseguir texto íntegro, escala anterior y configuración antes de cerrar validaciones |
| H-14 | R07 | Matriz Piloto.xlsx contiene bloques por disciplina y referencias a IBITE. Su guía identifica La Merced | Parcial. Confirmar si la ficha sirve para otras instituciones y qué columnas entran al primer incremento |

[Evidencia de IBITE](../06-reglas-negocio/ibite-puntuacion.md) · [Pruebas](../08-pruebas/fase-0.md) · [Importación](../09-importaciones/estrategia.md) · [MTTS](../06-reglas-negocio/mtts-formato-a.md) · [Factibilidad](../06-reglas-negocio/factibilidad-taller.md).

## Hallazgos adicionales de la Matriz Piloto

| ID | Requisito | Hallazgo y evidencia | Estado y acción |
|---|---|---|---|
| H-15 | R07, R14 | La guía describe CJ:CN como recomendaciones preliminares por disciplina | Confirmado en la fuente. Definir el vínculo con registros verificables de atención |
| H-16 | R03, R07 | La guía cita dos versiones de IBITE La Merced. CQ conserva una referencia de fila sin una columna de versión de origen contigua | Abierto. Confirmar trazabilidad por lote y evitar usar el número de fila como clave global |
| H-17 | R03, R07 | La guía concilia 184 registros previos y 40 añadidos hasta 224, y documenta deduplicación por nombre | Aritmética verificada. Conciliar unidades y acordar una clave para manejar homónimos, variantes y respuestas repetidas |
| H-18 | R07, R12 | Hay identificadores directos, campos disciplinarios sensibles y Edad aparece en dos bloques. No se observaron validaciones de celdas | Abierto. Acordar custodia, minimización, permisos, semántica y tipos por campo |

[Especificación de la Matriz Piloto](../06-reglas-negocio/matriz-resultados.md).

## Decisiones de acceso y publicación

| ID | Requisito | Hallazgo o decisión | Estado y acción |
|---|---|---|---|
| H-19 | R01, R02 | Estudiante, Acudiente, Orientador y Docente solo completan IBITE como operación interna | Confirmado. Validar habilitación, vínculo y variante; el libro de puntuación confirmado cubre cuidador y adolescente |
| H-20 | R01, R12 | Equipo de Apoyo Psicosocial puede acceder a toda la información | Confirmado para el acceso de lectura. Pendientes alcance institucional, permisos de operación y custodia nominal |
| H-21 | R09, R12 | El dashboard será público por URL | Confirmado. Seleccionar métricas agregadas publicables y validar las reglas contra identificación indirecta |

[Permisos y custodia](../07-seguridad/permisos-custodia.md).

## Actualización de variantes y permisos

| ID | Requisito | Hallazgo o decisión | Estado y acción |
|---|---|---|---|
| H-22 | R02, R04 | El usuario confirmó el formulario de docentes, administrativos y orientadores. El archivo se identifica como IBITE-DA-28 y contiene Puntuaciones, Escalas, Acciones y Recomendaciones propias | Confirmado para captura. Especificar y probar sus reglas como instrumento separado |
| H-23 | R01, R12 | El usuario amplió H-20 y confirmó las operaciones internas mencionadas para el Equipo de Apoyo Psicosocial en la etapa inicial | Confirmado. Documentar alcance y auditoría por operación. Registrar futuras restricciones al acordarlas |

## Custodia confirmada

| ID | Requisito | Decisión | Estado y acción |
|---|---|---|---|
| H-24 | R01, R12 | La Universidad de Manizales custodia los datos. La base del proyecto almacenará los registros completos, incluidos los nominales. Su consulta individual se reserva al Equipo de Apoyo Psicosocial de la Universidad | Confirmado. Aplicar el control en servidor y definir conservación, infraestructura y administración técnica |
| H-25 | R04 | IBITE-DA-28 exige 20 ítems núcleo completos, usa escala 0–4 y no usa el código 9. Las fórmulas consultadas tratan como Sin datos la seguridad cuando falta un ítem, y pueden emitir una recomendación de valoración con indicador general insuficiente si faltan otros ítems | Trazado por inspección de la fila 2. Recalcular casos sintéticos y validar el tratamiento operativo antes de activar alertas |

| ID | Requisito | Hallazgo | Estado y acción |
|---|---|---|---|
| H-26 | R03, R04 | INC-IBITE-02. IBITE-DA-28 presenta tres tramos de filas desplazadas. La marca temporal, el nombre y los ítems son coherentes dentro de cada fila, pero Puntuaciones 1000 y 1001 comparten la referencia de origen 1228 | Abierto. Conciliar los saltos y resolver la referencia repetida antes de importar resultados |
| H-27 | R04 | En Excel pasaron 33 comprobaciones de 14 variantes sintéticas del IBITE-DA-28 | Verificado para las salidas ensayadas. Pendiente ampliar cobertura de recomendaciones y perfiles |

[Incidencia de importación](../09-importaciones/estrategia.md) · [Resultados de pruebas](../08-pruebas/fase-0.md).

## Decisiones que afectan el contrato de captura

| ID | Requisito | Hallazgo o propuesta | Estado y acción |
|---|---|---|---|
| H-28 | R02 | La rama cuidador requiere distinguir la cuenta que envía de la persona evaluada; el vínculo no se deriva del rol Acudiente | Abierto. Definir habilitación, alcance y caso de varios acudientes |
| H-29 | R02 | Un reintento de red y dos envíos para la misma aplicación requieren controles distintos | Propuesta. Idempotencia para reintentos y unicidad para la regla de envío aprobada. Confirmar si se permiten borradores y correcciones |

| ID | Requisito | Hallazgo o propuesta | Estado y acción |
|---|---|---|---|
| H-30 | R01, R02 | Para campañas esporádicas se propone código individual de un solo uso y sesión revocable limitada a la asignación | Pendiente de aprobar canal de entrega, vigencia, reemisión y operador habilitador |
| H-31 | R02, R09 | Una persona de IBITE-DA-28 puede tener más de una vinculación institucional. La unidad por campaña o por institución cambia la unicidad y los denominadores | Pendiente de confirmar antes de cerrar captura y métricas |

| ID | Requisito | Hallazgo o propuesta | Estado y acción |
|---|---|---|---|
| H-32 | R09, R12 | Los totales y filtros públicos pueden permitir deducir una celda retenida por diferencia | Propuesta de control. Acordar cortes, filtros y retención complementaria con el custodio y comprobar con datos sintéticos |
| H-33 | R09 | Aplicaciones, personas y resultados válidos de una dimensión tienen denominadores distintos | Definición pendiente por métrica. Aprobar unidad, reglas de elegibilidad, faltantes y versiones antes de publicar |

| ID | Requisito | Hallazgo o propuesta | Estado y acción |
|---|---|---|---|
| H-34 | R03, R04 | Las referencias desplazadas evidencian que una fila de puntuación y una fila de respuesta tienen procedencias distintas | Propuesta de conservar ambas coordenadas, registrar las correspondencias aprobadas y probar los dos casos sintéticos de importación |
| H-35 | R03, R04 | Los resultados calculados en un archivo histórico y los resultados recalculados en el backend requieren procedencia y reglas de comparación | Pendiente decidir qué resultados conservar y cómo resolver discrepancias |

| ID | Requisito | Hallazgo o propuesta | Estado y acción |
|---|---|---|---|
| H-36 | R01, R12 | El permiso amplio del equipo permite distinguir consulta operativa, consulta nominal y exportación como acciones auditables | Propuesta. Confirmar campos necesarios, finalidad, y política de descarga y conservación |
| H-37 | R07, R14 | La unidad de caso afecta el vínculo longitudinal entre evaluaciones, orientaciones e intervenciones | Pendiente. Confirmar si el caso corresponde a persona, episodio o campaña antes del esquema definitivo |

| ID | Requisito | Hallazgo | Estado |
|---|---|---|---|
| H-38 | R03 | El Excel -23 tiene 7.554 filas de formulario con fecha nativa frente a 7.557 filas de fórmulas revisadas; el cruce simple con el catálogo deja 2.919 valores de H y 1.815 de AQ sin coincidencia | Pendiente conciliar unidades, cortes, correspondencias y normalización |
| H-39 | R04, R12 | Las observaciones de seguridad preservan simultáneamente positivos y faltantes mediante una salida separada | Confirmado en pruebas sintéticas. Pendiente uso operativo y aprobación de notificaciones |
| H-40 | R01, R04 | El ámbito institucional se exige en el servidor en la consulta de resultados. Una pertenencia común no concede acceso y la revocación se refleja con el token existente | Verificado. Pendientes gestión auditada de asignaciones y extensión a los demás recursos |

| ID | Requisito | Evidencia | Estado |
|---|---|---|---|
| H-41 | R06 | Factibilidad ya controla reintentos técnicos. Queda definir cuándo dos fichas ingresadas por separado corresponden al mismo taller, cómo corregirlas y qué indicadores calcular. | Pendiente de definición funcional. Se conserva el registro original y no se infieren duplicados ni puntuaciones. |
