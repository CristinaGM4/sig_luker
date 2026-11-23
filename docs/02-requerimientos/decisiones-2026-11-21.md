# Decisiones funcionales del 21 de noviembre de 2026

## Aprobadas

| ID | Requisito | Decisión |
|---|---|---|
| DF-01 | R02 | IBITE semestral, una aplicación definitiva por persona evaluada, instrumento y periodo. La variante, versión, institución, fecha y estado son trazables. La jornada del 30 de noviembre es tentativa y configurable |
| DF-02 | R01/R02 | Docentes, directivos y administrativos responden DA. Orientadores conservan su asignación DA ya confirmada. Acudientes con cuenta individual solo responden por menores de 11 años con vínculo verificable; una cuenta puede vincularse a varios menores. Mantener separadas persona evaluada y respondiente |
| DF-03 | R01/R04/R07/R11/R12/R14 | El Equipo de Apoyo Psicosocial consulta únicamente instituciones asignadas explícitamente. Los administradores técnicos carecen de acceso implícito. La gestión de asignaciones requiere rol autorizado y auditoría |
| DF-04 | R04/R12 | Conservar señales positivas aunque falten respuestas. Representar información insuficiente y no convertir faltantes en ausencia de riesgo. Avisos críticos únicamente al equipo autorizado de la institución cuando metodología, destinatarios y canales se aprueben. Sin orientación individual al participante |
| DF-05 | R03 | Importar por identificador interno estable y procedencia archivo, hoja y fila. Nombres y teléfonos solo ayudan a señalar coincidencias para revisión. Sin fusión automática. Conservar originales, faltantes y nombres institucionales de origen |
| DF-06 | R09/R12 | Dashboard público anónimo solo con agregados autorizados. Dashboard privado autenticado con ámbito institucional. Datos públicos reales pendientes de política de divulgación |
| DF-07 | R02/R04 | Persistir aplicaciones, respuestas originales, múltiples resultados versionados y su procedencia. Conservar historial y evitar sobrescritura |

El dashboard aprobado es público para visitantes, mientras que la cuenta de acudiente no tiene permisos de dashboard ni ruta privada. El control de la vista pública se basa en divulgación y opera sin sesión.

## Decisiones técnicas del incremento

- Las aplicaciones definitivas tienen una clave única persona–instrumento–periodo, independiente de institución y variante. Aplicaciones provisionales y asignaciones de campaña se modelarán al validar el contrato de captura. Los resultados pueden coexistir por aplicación y conservan versión y procedencia.
- La relación profesional–institución es distinta de AccountInstitution. El filtro de objeto consulta las asignaciones vigentes en la base. Esta versión usa la presencia de la relación como vigencia; los flujos de alta, baja y auditoría de cambios se especificarán con el rol autorizado. La existencia de una asignación por sí sola no habilita a un rol técnico.
- Las observaciones de seguridad se calculan por separado de las salidas históricas de los Excel. Se conservan ítems positivos, faltantes y no aclarados. No se cambia la clasificación de referencia ni se activa un flujo de notificación.
- El estado del modelo inicial se limita estructuralmente a aplicaciones definitivas. La escritura productiva, las correcciones, persistencia de resultados mediante servicio y el historial de operaciones quedan para el flujo de escritura aprobado.

## Validaciones y riesgos pendientes

- Revisar formularios originales completos, opciones, obligatoriedad, edad mínima de la rama cuidador, momento de corte de edad, consentimiento, recuperación de credenciales y autorización verificable de acudientes. La regla menor de 11 años no amplía por sí sola la población del libro IBITE-17, que describe de 5 a 10 años.
- Definir rol de gestión de asignaciones, auditoría nominal, estados y procedimientos de corrección, canal y contenido de notificación, y política de divulgación. El uso de la URL pública por un visitante anónimo no permite conocer el rol de una persona.
- La fecha tentativa se documenta como parámetro futuro de campaña. Mantenerla fuera de importaciones y de valores por defecto del esquema.
- En el histórico, validar normalización, cortes y tratamiento de referencias ambiguas. El catálogo de alias requiere comprobar duplicidad y variantes antes de utilizarlo.

## Actualización del piloto posttest IBITE-17

| ID | Requisito | Confirmación |
|---|---|---|
| DF-08 | R02 | Apertura del posttest el **25 de noviembre de 2026**. Esta fecha sustituye la tentativa del 30 de noviembre para el posttest. Quedan por confirmar hora de apertura, cierre y periodo académico. |
| DF-09 | R01/R02/R12 | El **Dr. Felipe Agudelo** es el responsable designado de la habilitación masiva de estudiantes. Pendientes su cuenta institucional, el permiso operativo, el listado de entrada autorizado y el alcance de la habilitación de acudientes. La designación no aprovisiona el acceso. |
| DF-10 | R02/R03 | La captura adjunta confirma diez instituciones priorizadas. Los nombres visibles se registran abajo. El catálogo oficial debe aportar los identificadores para configurar las campañas. |

### Instituciones priorizadas

- IE Fe y Alegría La Paz
- IE Colegio de Cristo
- IE Escuela Normal Superior de Manizales
- IE La Asunción
- IE Liceo Mixto Sinaí
- IE Bosques del Norte
- IE La Sultana
- IE San Pío X
- IE Instituto Latinoamericano
- IE Instituto Técnico Francisco José de Caldas

Fuente de DF-08 y DF-09: confirmación del responsable del proyecto. Fuente de DF-10: captura de instituciones adjunta. La apertura para DA-28 debe confirmarse con su formulario y configuración.

## Consentimiento y programación del posttest

| ID | Requisito | Decisión vigente |
|---|---|---|
| DF-11 | R02/R12 | Cuando se recibe una negativa en el consentimiento del posttest, el sistema conserva esa decisión. Una negativa de participación no autoriza continuar con la captura. |
| DF-12 | R02 | Los estudiantes mayores de edad que usan la variante adolescente siguen el mismo formulario y flujo de consentimiento que los demás estudiantes de esa variante. |
| DF-13 | R02 | Posttest IBITE-17 del Periodo 2, del 25 de noviembre al 10 de diciembre de 2026, ambos días incluidos, para las diez instituciones priorizadas. |

| DF-14 | R02/R09/R12 | Si el estudiante de la variante adolescente participa e indica que no sabe si tiene autorización, se conservan sus respuestas y la declaración de incertidumbre. Los registros pueden contribuir a las métricas autorizadas. La respuesta se identifica como incierta. |

## Decisiones de operación del piloto

| ID | Requisitos | Decisión |
|---|---|---|
| DF-15 | R02/R12 | Conservar el texto actual del aviso del formulario publicado. |
| DF-16 | R01/R02/R12 | El vínculo del acudiente se busca con el par nombre del estudiante y Teléfono de contacto de la encuesta. El responsable del proyecto confirma que el par no generará coincidencias múltiples en el piloto. |
| DF-17 | R01/R02/R12 | El Dr. Felipe Agudelo podrá activar y desactivar la campaña desde su rol autorizado, además de su función de habilitación masiva de estudiantes. Aplica al piloto del Periodo 2. |

### Configuración verificable del Periodo 2

La [configuración del piloto](ibite17-piloto-periodo-2.json) conserva las diez instituciones de DF-10. Para las fechas expresadas por día se usa hora local de Manizales, con apertura el 25 de noviembre a las 00:00 y cierre exclusivo el 11 de diciembre a las 00:00. Así se incluye todo el 10 de diciembre. La prueba de integración usa las fechas en PostgreSQL y verifica el mismo filtro de habilitación de la API.

## Apertura del posttest por campaña

**DF-18 · R01/R02/R12.** El Dr. Felipe Agudelo habilita la campaña del Periodo 2. Una persona dentro del alcance del instrumento puede iniciar y responder aunque no haya participado en la primera muestra. Se elimina la aprobación individual previa y el padrón histórico como requisito de entrada. Esta decisión sustituye la habilitación masiva basada en un listado previo de DF-09 y DF-17. Se mantienen las diez instituciones priorizadas, la ventana confirmada y las reglas de consentimiento de cada rama. La muestra histórica se conserva como referencia para análisis.

## Entrada pública por enlace de campaña

**DF-19 · R01/R02/R12.** Una persona nueva puede abrir IBITE-17 desde un enlace de formulario de la campaña sin cuenta previa, inicio de sesión visible, aprobación individual ni inclusión en la muestra histórica. El acceso público se limita a iniciar y responder el instrumento durante una campaña activa. La consulta de resultados individuales sigue restringida.

## Identificación declarada en el enlace de IBITE-17

**DF-20 · R01/R02/R12.** El documento se solicita a todos los respondientes que inicien el flujo nuevo, hayan contestado anteriormente o no. Para un menor de 5 a 10 años se solicita el documento de quien contesta y se distingue al menor mediante su nombre y el Teléfono de contacto acordado. Desde los 11 años y hasta los 19 corresponde el documento del propio adolescente, conforme al rango de la rama publicada. Una respuesta histórica carente de documento no se vincula por coincidencia automática.
