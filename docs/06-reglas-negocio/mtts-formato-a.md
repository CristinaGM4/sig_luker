# Especificación de captura MTTS Formato A

R05 / I06. Borrador para revisión. Fuente: Instrumentos IBITE Implementación .docx, apartado anterior al Formato B. El Word denomina al piloto MTSS y el proyecto usa MTTS. Se mantiene MTTS como nombre del módulo hasta confirmar la denominación. Alcance confirmado por el usuario: Formato A únicamente.

## Unidad de registro

Una ficha por institución/sede y semana, diligenciada por el profesional que ejecutó o coordinó las actividades. La ficha recoge la percepción profesional y, cuando hay datos, conteos agregados. Evitar nombres u otros identificadores de estudiantes, incluidos en textos libres. Registrar por separado la cuenta que realiza el envío y el rol declarado en la ficha. El rol declarado describe el contexto y la autorización proviene de permisos aprobados en el servidor.

## Campos y validación

| Sección | Campos en el Word | Tipo y reglas de captura |
|---|---|---|
| Contexto | Inicio y fin de semana, institución, sede, rol | Fechas y referencias de catálogo. Roles del instrumento: psicología, psicosocial/familia, liderazgo clínico, coordinación, datos/tablero, gestión del riesgo y otro con detalle. Confirmar cardinalidad de roles y vigencia de las fechas |
| Actividades | Revisión de alertas/tablero, valoración individual, contacto familiar, intervención breve, grupo de apoyo, encuentro universal, remisión y seguimiento, georreferenciación, plan escolar de riesgo, otra | Selección múltiple. Registrar detalle de Otra. Falta confirmar si puede enviarse sin actividades |
| Conteos opcionales | Valoraciones, contactos familiares, remisiones, enlaces confirmados, sesiones grupales y encuentros universales, más casilla Datos no disponibles | Propuesta de enteros no negativos. Distinguir cero, dato faltante y bloque no disponible. Pendiente confirmar si se permiten conteos parciales o reutilizar los del tablero |
| Percepción semanal | Aceptabilidad, adecuación/pertinencia, factibilidad, fidelidad, adopción, integración/coordinación, seguridad y calidad del registro | Una valoración por dimensión. Opciones 1 Nunca/nada, 2 Rara vez/poco, 3 A veces/parcialmente, 4 Casi siempre/bastante, 5 Siempre/completamente y NA. Distinguir NA de faltante |
| Barreras | Tiempo/calendario escolar, carga de casos, personal insuficiente, dificultad de contacto familiar, ausentismo o movilidad, conectividad/tablero, datos incompletos, coordinación escolar, capacidad de salud/protección, estigma/desconfianza, transporte/acceso, confidencialidad/acuerdos, ninguna, otra. Pregunta sobre barrera principal y actividad afectada | Hasta tres opciones. Pendiente aprobar exclusividad de Ninguna y cuándo exigir detalle |
| Facilitadores | Compromiso de directivos, orientación escolar, apoyo Fundación Luker/plataforma, coordinación Universidad–escuela, participación familiar, protocolos claros, red de salud/protección, trabajo interdisciplinario, materiales adecuados y otro. Pregunta sobre el facilitador principal | Hasta tres opciones. Texto para detalle de Otro y respuesta narrativa |
| Respuesta y mejora | Ajuste inmediato Sí/No/No sé, ajuste aplicado o recomendado con responsable y plazo, estado semanal, escalamiento Sí/No y tema | Estado: en curso según lo previsto, con retrasos recuperables o con dificultades que requieren decisión directiva. Confirmar condiciones de obligatoriedad del detalle de ajuste y del tema de escalamiento |

## Contrato candidato

Operación propuesta: registrar ficha semanal. Entrada: versión del formato, institución/sede, semana y secciones de captura. Salida: identificador, versión y contexto de la ficha registrada. Errores esperados: entrada inválida, identidad ausente, acción o sede fuera del ámbito y conflicto por ficha existente. Definir ruta, códigos HTTP, obligatoriedad y semántica de corrección antes de publicar OpenAPI.

Propuesta de unicidad: versión de formato, institución, sede y semana. Confirmar si una ficha se consolida entre varios profesionales, si una ficha institucional sin sede puede coexistir con las de sede y cómo se corrige un envío. Probar la unicidad con envíos simultáneos una vez aclarada la identidad de ficha.

## Criterios de aceptación propuestos

| ID | Caso a verificar |
|---|---|
| MTTS-A-01 | Un profesional autorizado registra una ficha para una semana y una sede de su ámbito y recupera sus datos con la versión aplicada |
| MTTS-A-02 | La operación rechaza un acceso fuera de ámbito y un segundo envío cuando la clave de ficha coincide |
| MTTS-A-03 | Se rechazan cuatro barreras o cuatro facilitadores y una valoración fuera de 1–5/NA |
| MTTS-A-04 | Se conservan por separado una dimensión NA, una dimensión faltante cuando se permita y un conteo registrado como cero |
| MTTS-A-05 | Las reglas de texto y los permisos previenen la exposición de identificadores; la revisión incluye un caso sintético con dato personal en narración |
| MTTS-A-06 | El sistema conserva la factibilidad como dimensión de la ficha y el formulario de taller como requisito independiente |

El anexo del Word describe alertas de implementación sujetas a aprobación del comité. La primera captura puede especificarse y verificarse sin automatizarlas. Para análisis posterior, el Word propone distribución y mediana por dimensión, frecuencia de barreras y facilitadores y porcentaje de NA. Los tiempos de atención y otros indicadores operativos se verifican con su fuente, tal como indica el instrumento.

Huella SHA-256 del Word revisado: B9DE08BEEC0BF238E0175E7011D854161A480960EBFFD2B45744F1D71A5C56E9.

## Verificación del original y alcance del primer incremento

El Word confirma la unidad profesional–institución/sede–semana en la guía de análisis. Se usa la cuenta autenticada como autor y se conserva por separado el rol declarado. Se registra una ficha por profesional, institución, sede normalizada y fecha de inicio semanal. Se conserva el texto de sede ingresado y se normalizan mayúsculas, espacios y Unicode para controlar duplicados. Falta un catálogo oficial de sedes para conciliar alias. No se infiere una semana calendario obligatoria ni se mezclan semanas con distintos inicios.

Se implementó el [contrato REST inicial](../05-contratos-api/mtts-formato-a.md) con consulta de la definición, creación, acuse y consulta de ficha. El registro conserva valoraciones 1–5, NA y ausencia de campo, además de conteo cero y no disponibilidad. Las reglas de alertas del anexo quedan pendientes de aprobación del comité. No se calcula un puntaje global.

Las [reglas versionadas de alertas](mtts-alertas-formato-a.md) recogen los niveles del anexo, la prioridad, los faltantes y los casos de aceptación sintéticos. Quedan para revisión del comité.

## Consulta y análisis descriptivo

R05. El [contrato REST](../05-contratos-api/mtts-formato-a.md#listado-y-resumen-por-intervalo) implementa listado por inicio de semana, distribución 1–5, mediana por dimensión, frecuencia por opción y porcentaje de NA. Se conserva el conteo separado de faltantes. Los indicadores operativos del tablero y las alertas del comité permanecen fuera de este corte.
