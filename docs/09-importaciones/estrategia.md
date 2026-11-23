# Importación histórica y fichas

Inspeccionar primero un diccionario y muestras desidentificadas autorizadas. Perfilar encabezados, tipos, duplicados, nulos y catálogos; documentar equivalencias y conflictos. Registrar fuente, huella, versión de mapeo, actor, lote y fila; excluir archivos temporales y copias redundantes. Distinguir reenvío del mismo archivo de duplicados entre archivos distintos.

Conservar los originales bajo custodia aprobada. Validar en área de preparación, producir diagnóstico por fila sin identificadores sensibles y publicar transaccionalmente según política aprobada. Conciliar leídas = aceptadas + rechazadas + omitidas por duplicado según estados excluyentes. Tratar Excel como datos y desactivar ejecución de contenido activo. Confirmar si el histórico admite aceptación parcial explícita; una ficha inválida deja intactos los datos publicados.

## INC-IBITE-01 · Referencias desplazadas en el histórico

Estado: abierta. Afecta R03 y R04. Fuente: IBITE Manizales (respuestas)-23.xlsx, identificado en las [reglas de validación](../06-reglas-negocio/validacion.md).

Al comparar R:BG en 7.557 filas con fórmulas, las 17 diferencias se concentraron en Puntuaciones R7558:AH7558. En las dos ramas, esos ítems toman los valores de la fila 7560 de Respuestas de formulario 1. El patrón de referencia toma los valores de la fila con el mismo número. Existe el riesgo de atribuir resultados a un registro distinto.

Durante la preparación de la importación, marcar esa correspondencia para revisión y conservar referencias de origen y fórmulas intactas. La persona responsable de la exportación debe confirmar si el desplazamiento es intencional y qué fila corresponde. Para cerrar la incidencia, registrar esa decisión y verificar con una prueba que el proceso vincula o excluye el registro conforme a la decisión aprobada.

## INC-IBITE-02 · Correspondencias de origen en IBITE-DA-28

Estado: abierta. Afecta R03 y R04. En Puntuaciones se compararon 1.953 filas de fórmulas T:CA ajustadas desde la fila de referencia. Las 37.016 diferencias aparecen en los 28 ítems de 1.322 filas. Referencias al formulario: filas 633–649 con desplazamiento +1, 650–1000 con +228 y 1001–1954 con +227.

Dentro de cada fila, la marca temporal, el campo nominal y los 28 ítems apuntan a la misma fila del formulario. Se observó una referencia repetida: Puntuaciones 1000 y 1001 apuntan ambas a la fila 1228. Esta verificación comprueba referencias de fórmulas. No determina si los saltos fueron intencionales ni si representan un subconjunto autorizado.

Conservar origen y fila de cálculo por separado. Antes de importar puntuaciones históricas, conciliar el subconjunto con la persona responsable del archivo y resolver la referencia repetida. No calcular el número de participantes únicos contando filas de Puntuaciones.

El [contrato candidato de importación histórica](../05-contratos-api/ibite-importacion-historica.md) propone el diagnóstico, la revisión y la publicación de lotes IBITE.

## Inspección del Excel Manizales y reglas confirmadas

En la copia -23 verifiqué solo encabezados. La hoja se llama Respuestas de formulario 1; A contiene Marca temporal, H contiene Institución educativa y AQ contiene Tu institución educativa es (segunda rama). Catalogo_Colegios tiene columnas Variante y Etiqueta_unificada. Se requiere perfilar variantes repetidas y alias con múltiples destinos antes de homologar. Mantener texto original y referencia exacta de archivo, hoja y fila.

No existe una identidad global confiable para fusionar personas. Nombre y teléfono sirven para marcar coincidencias, sin fusiones automáticas. La idempotencia por procedencia y la revisión de duplicados entre fuentes son controles distintos. La fecha prevista para una jornada futura no rellena marcas históricas.

Perfil de solo lectura de la copia -23: 7.554 filas con datos dentro del rango inspeccionado A:AQ, todas con fecha Excel nativa. Las 7.557 filas de fórmulas en Puntuaciones son otra unidad y deben conciliarse antes de usar cualquiera de los totales. El catálogo produjo 931 alias tras recortar extremos e ignorar mayúsculas, sin alias con más de una etiqueta bajo esa transformación. El cruce simple de valores no vacíos dio H: 1.754 coincidencias únicas y 2.919 sin coincidencia; AQ: 952 y 1.815 respectivamente. Son conteos por celda y no por persona. No se aplicaron normalizaciones ni se aceptó una coincidencia como definitiva.

La [conciliación posterior](conciliacion-ibite-manizales.md) precisa INC-IBITE-01 y explica las tres filas excedentes.

[Conciliación DA-28](conciliacion-ibite-da28.md): la coordenada 1228 de INC-IBITE-02 está vacía en la copia revisada; 1000 y 1001 repiten esa referencia y permanecen trazables.

La persistencia interna almacena solo totales, hojas, coordenadas y códigos. La repetición idempotente no duplica el diagnóstico ni su auditoría. Las revisiones técnicas son aditivas. Las facultades de aprobar correcciones o liberar lotes requieren decisiones adicionales.

Las referencias técnicamente no resolubles forman parte del diagnóstico v2. El extractor pasa la coordenada de cálculo con origen nulo. El registro conserva la incidencia sin establecer una vinculación de respuesta. Los históricos previos conservan su versión.

## Perfil estructural del archivo padron.xlsx

La fuente entregada es una exportación de resultados. Se examinó localmente en solo lectura. `Sheet1` contiene cinco columnas y 4.718 filas con al menos un valor. El rango declarado incluye filas vacías.

| Columna | Campo | Uso candidato |
|---|---|---|
| A | Codigo | Encabezado presente. Cero valores en las filas con datos. |
| B | Nombre completo del niño, niña o adolescente | Primera parte de la búsqueda histórica. |
| C | Teléfono de contacto | Segunda parte de la búsqueda histórica. |
| D | Aceptación y autorización | Decisión histórica. Su uso para el Periodo 2 requiere confirmación. |
| E | Institución educativa | Etiqueta de origen para normalizar contra catálogo autorizado. |

Hay 1.614 etiquetas institucionales distintas después de recortar espacios exteriores y 44 filas sin institución. Hay 46 filas sin nombre o teléfono. En los pares completos, se encontraron 187 pares repetidos que abarcan 374 filas. Para ese cálculo se normalizó el nombre con NFKC, espacios y mayúsculas, y se recortó el teléfono. En 104 pares repetidos difieren las etiquetas institucionales observadas, incluido un eventual valor vacío. Una diferencia textual puede ser un alias. La repetición de filas no distingue una persona repetida de dos personas distintas.

Para el piloto se propone usar un identificador interno generado tras confirmar la identidad y conservar la procedencia por archivo, hoja y fila. La búsqueda por nombre y teléfono puede devolver varias filas de este histórico. Se requiere resolver las coincidencias y validar aliases antes de habilitar automáticamente. El análisis no importó filas, guardó identificadores nominales ni cambió el Excel.

## Fuente histórica normalizada de monitoreo

El responsable confirmó que `padron.xlsx` es histórico y no habilita ni excluye participantes del Periodo 2. El Excel `IBITE Monitoreo.xlsx` contiene hojas de seguimiento URGENTE, ALTA, MEDIA y BAJA, con la institución educativa en la columna G. Se contaron 290, 635, 330 y 6.101 filas con etiqueta institucional, respectivamente. Las diez instituciones priorizadas tienen coincidencia directa al normalizar acentos, mayúsculas, espacios y el prefijo IE. Quedan 278 etiquetas distintas en ese conteo del libro completo. Este inventario orienta la normalización histórica. No implica identidad de personas, aprobación de alias restantes ni importación de registros.
