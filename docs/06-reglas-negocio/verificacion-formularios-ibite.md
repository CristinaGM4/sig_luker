# Verificación de formularios IBITE para captura

Las exportaciones Excel de referencia contienen encabezados, respuestas y mapeo de los ítems a puntuación. Se confirmó la presencia de preguntas exportadas de consentimiento y participación. La obligatoriedad en el formulario, su lógica condicional, el texto completo de autorización y el mecanismo de verificación de vínculo requieren el formulario original y su configuración.

| Variante | Evidencia verificada | Pendiente |
|---|---|---|
| IBITE-17 cuidador | 17 ítems T:AJ. C contiene la pregunta de aceptación y autorización. La referencia describe cuidador de 5–10 años | Opciones exactas por ítem, saltos, obligatoriedad, fecha para cálculo de edad, habilitación y autorización verificable de cada menor |
| IBITE-17 adolescente | 17 ítems BC:BS. La puntuación usa AK como dato de participación. La referencia describe 11–19 años | Opciones y obligatoriedad, asentimiento y condiciones de consentimiento del representante, según original y aprobación |
| IBITE-DA-28 | 28 ítems R:AS. B contiene aceptación y autorización. El núcleo de puntuación exige 20 ítems. Docentes, orientadores, administrativos y directivos usan esta variante | Confirmar tipos, opciones, obligatoriedad y texto de autorización. El núcleo de puntuación no define por sí mismo la obligatoriedad de captura |

## Persistencia y autorización de envío

El servicio interno recibe únicamente una solicitud que el futuro controlador ya validó por asignación, variante, ventana, consentimiento y campos requeridos. Resuelve la versión del instrumento, calcula y registra aplicación, respuestas originales, resultado y evento técnico de auditoría en una sola transacción. La clave de PostgreSQL garantiza una definitiva por participante, instrumento y periodo incluso con concurrencia. Se preservan la documentación histórica y las reglas de referencia.

La API de formulario y envío sigue en borrador hasta verificar los formularios originales y la habilitación de cada participante. La función de persistencia no se registra como ruta ni sustituye la validación previa, y no inicia notificaciones.

El servicio interno ya comprueba habilitación propia vigente, permiso actual y ventana de campaña directamente en la transacción. El invocador sigue a cargo de formulario original y consentimiento.

## Revisión del Word adjunto para el posttest

El archivo **IBITE CONTESTADO POR PADRE.docx** contiene 33 capturas de un formulario, con 16 para cuidador y 17 para adolescente. Se revisó localmente. SHA-256: `9f8d2e0b4de6bfc3932f291508e2db83f7d7f8adce272b4c7dace2f40608b00f`.

| Rama | Evidencia visual | Pendiente de contrastar |
|---|---|---|
| Cuidador | El selector inicial indica que responde por una persona de 5 a 10 años. La pantalla de consentimiento contiene una decisión obligatoria Sí/No para participar y autorizar el uso de la información. Le siguen datos sociodemográficos, afectaciones relacionadas con el temblor y rejillas de bienestar. | Destino de la opción No, verificación del vínculo, texto autorizado para el posttest y mapeo exacto de opciones por ítem. |
| Adolescente | El selector indica respuesta directa entre 11 y 19 años. La pantalla de asentimiento presenta dos preguntas separadas y marcadas como obligatorias. Una registra la voluntad de participar y otra el estado de autorización de padre, madre o acudiente, con opción de incertidumbre. | Forma de verificar la autorización y fecha de corte para la edad al habilitar. DF-14 confirma conservar respuestas con autorización incierta y usarlas en métricas autorizadas. DF-11 exige conservar la negativa y DF-12 aplica el mismo consentimiento a estudiantes mayores de edad. |
| Ambos | Las capturas muestran preguntas obligatorias, selección simple y múltiple, rejillas con escalas de frecuencia, dos ítems con opciones específicas de seguridad y mensajes de cierre. | Confirmar la obligatoriedad por fila y los saltos en la configuración original. Conciliar textos y opciones con el Excel de referencia antes de versionar el contrato de captura. |

El texto visible menciona a la Secretaría de Educación y al colegio. Confirmar la versión del aviso que corresponde al tratamiento bajo custodia de la Universidad de Manizales. El mensaje del formulario que anticipa contacto con un profesional es parte del material de referencia. Su traslado al posttest requiere validar el texto y el protocolo con el equipo autorizado. Las notificaciones reales siguen desactivadas.

Los anexos de identificación del piloto figuran en [decisiones funcionales](../02-requerimientos/decisiones-2026-11-21.md#actualización-del-piloto-posttest-ibite-17). DA-28 queda pendiente de su formulario original.

## Inventario de referencia versionado

El archivo [ibite17-formularios-evidencia.v1.json](ibite17-formularios-evidencia.v1.json) fija dos versiones de evidencia. Conserva los encabezados exactos exportados de las preguntas, sin filas de respuestas, las huellas de ambos archivos fuente y la correspondencia de entrada a puntuación. Los IDs `item-01` a `item-17` están acotados a cada variante. Estas versiones identifican el inventario revisado para especificación, mientras que `manizales-respuestas-23` identifica la fuente de puntuación del catálogo Prisma.

| Variante | Versión de evidencia | Consentimiento o asentimiento | Sociodemografía | Afectaciones | Puntuación |
|---|---|---|---|---|---|
| Acudiente | `ibite-17-acudiente-evidencia/1` | C | D:L | M:S | T:AJ → R:AH |
| Adolescente | `ibite-17-adolescente-evidencia/1` | AK y AL | AM:AU | AV:BB | BC:BS → R:AH |

Se verificaron las 34 referencias de origen en las fórmulas de `Puntuaciones!R2:AH2`. El selector de respondiente está en B y la marca temporal en A. El Excel adolescente conserva por separado voluntad de participar (AK) y declaración de autorización del representante (AL). Por tanto, este último dato no debe derivarse de AK ni incorporarse al puntaje.

### Cierre del formulario operativo

La evidencia visual y los encabezados permiten verificar las preguntas y su orden. Para publicar una versión de captura, el responsable del formulario debe confirmar las opciones por fila de rejilla, la obligatoriedad por fila, las validaciones de campos y el destino de cada decisión y salto. El aviso del posttest bajo custodia de la Universidad debe confirmarse, junto con el tratamiento de la negativa de autorización del representante y el procedimiento de vínculo verificable para acudientes. El formulario puede suministrarse como acceso de lectura a su configuración o como exportación de la configuración sin respuestas.

El estado del inventario es `reference-reviewed`. El arranque normal sigue sin registrar los endpoints de captura. La paridad OpenAPI/Postman verifica ese límite. El recorrido sintético queda disponible para pruebas mientras se cierra la configuración oficial.

## Versión 2 a partir del formulario impreso

`IBITE.pdf` (22 páginas) identifica el selector y los saltos iniciales: la pregunta 1 dirige a acudiente en la 2 o adolescente en la 22. La respuesta afirmativa del acudiente dirige a la 3. Las rejillas 19–21 y 40–42 fijan tres escalas por posición. Los ítems 1–6 usan frecuencia con «Varios días». Los 7–8 usan la escala de seguridad, incluida la incertidumbre. Los 9–17 usan la rejilla de frecuencia con «Algunos días». Se registraron sus opciones y huella en el [inventario v2](ibite17-formularios-evidencia.v2.json).

La pregunta 23 de autorización del representante no lleva asterisco en el PDF, aunque las capturas del Word la mostraban como obligatoria. El PDF distingue afirmativa, «No lo sé» con acompañamiento de un adulto y negativa explícita. La decisión DF-14 confirma conservar y utilizar las respuestas con autorización incierta cuando el adolescente acepta participar. Para la captura real queda por confirmar la obligatoriedad efectiva y qué flujo se aplica si la pregunta se omite o se declara negativa. La demostración exige declaración en la rama adolescente para sus casos sintéticos. La rama acudiente usa su propia aceptación y omite esa pregunta.

El PDF confirma el contenido visible, los asteriscos de las rejillas y algunas transiciones. Quedan por confirmar la configuración por fila, el tratamiento de negativas, la versión del aviso bajo custodia de la Universidad y la verificación de vínculo de acudientes.

## Configuración del formulario publicado

Revisión del 21 de noviembre de 2026, en modo de lectura, sin enviar respuestas. [Formulario publicado](https://docs.google.com/forms/d/e/1FAIpQLSdkCbWKyEwo57o6wd-kFF8khAKQo8FZhLPYUJQVxT33f3EBnQ/viewform).

- La pregunta 23 de autorización del representante es obligatoria en la versión publicada. Tanto la respuesta afirmativa como «No lo sé» llevan a la siguiente sección. «No lo autorizó» está configurada para terminar y enviar el formulario de Google. Para SIG-LUKER se debe conservar la negativa sin puntuar ni generar una aplicación definitiva, sujeto a confirmar el alcance operativo del registro.
- La negativa de consentimiento del acudiente también termina y envía el formulario. La voluntad de participación del adolescente es una pregunta obligatoria separada.
- Las dos ramas tienen 17 filas puntuables obligatorias, en rejillas de 6, 2 y 9 filas. Cada fila admite una opción y las tres listas de opciones coinciden con el inventario v2.
- Se resuelve la discrepancia de obligatoriedad de la pregunta 23 entre las fuentes impresas. DF-15 confirma conservar el aviso actual. DF-16 confirma nombre y teléfono para buscar el vínculo. Quedan el origen de datos, las excepciones de búsqueda y los parámetros del piloto.
