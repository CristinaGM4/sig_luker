# Demostración REST de IBITE-17

## Cómo repetirla

Desde la raíz del backend, ejecutar:

```powershell
./scripts/verify-isolated-db.ps1
```

El script provisiona PostgreSQL/PostGIS temporal, ejecuta la demostración y emite tres líneas `DEMO IBITE` con los resultados obtenidos mediante HTTP. La prueba genera participantes, campañas, habilitaciones y sesiones sintéticos. El contenedor de pruebas se retira al terminar.

La [colección Postman](../05-contratos-api/postman/ibite-captura-sintetica.postman_collection.json) incluye ejemplos de envío y consulta. Para una ejecución manual se necesita una instancia sintética activa, su URL local, una sesión y habilitación de cada variante y una sesión psicosocial con asignación a la institución. Los identificadores se obtienen de esas habilitaciones y de los acuses. Para repetir un envío se reutiliza su clave de idempotencia.

## Evidencia de la ejecución

| Caso | POST | Señal de seguridad | Clasificación de referencia | Ítems |
|---|---|---|---|---|
| Adolescente acepta participar e indica «No sé» sobre la autorización | 201 | Alerta | `critico_seguridad` | Positivo 7. Por aclarar 8. |
| Acudiente acepta participar y declara incertidumbre en el primer ítem de seguridad | 201 | No aclarada | `alto_seguridad_no_aclarada` | Por aclarar 7. |
| Acudiente acepta participar sin señal en los ítems de seguridad | 201 | Ninguna | `medio_alto` | Sin ítems de seguridad señalados. |

Cada POST envía 17 opciones válidas para su formulario de prueba. El primer caso guarda las respuestas y la autorización declarada como incierta. La incertidumbre del ítem 8 es un dato distinto y no elimina la señal positiva del ítem 7. En el tercer caso, la ausencia de señal de seguridad convive con una clasificación general medio-alta de la regla de referencia.

El POST devuelve un acuse. El equipo psicosocial con asignación vigente consulta `GET /api/v1/interno/aplicaciones-ibite/{aplicacionId}/resultados` y recibe `dimensions.safetySignal`, `classification.risk` y `safetyObservations`. La prueba comprueba el rechazo del respondiente y de un profesional sin asignación. El sistema no envía correos, mensajes ni notificaciones con estos resultados.

## Alcance de la demostración

El arranque sintético simula ambas ramas. Usa las escalas de las rejillas documentadas en el PDF y preguntas sintéticas. El acuse, el cálculo y la auditoría utilizan los servicios reales del backend. La activación con datos reales requiere cerrar el formulario operativo, las decisiones de consentimiento y la habilitación de participantes. Ver [verificación del formulario](../06-reglas-negocio/verificacion-formularios-ibite.md).

### Repetición tras reinicio

`test/ibite-results.test.mjs` envía un documento sintético, cierra la aplicación Nest y vuelve a iniciarla con la misma clave y base de datos. Una nueva sesión para ese documento obtiene una habilitación propia, pero el segundo envío recibe 409. Su acuse devuelve 404. La sesión original aún puede recuperar su acuse y la base conserva una sola aplicación definitiva.

## Abrir la demo local para Postman

La demo manual se ejecuta con `npm run start:ibite-demo` después de compilar con `npm run build` y migrar la base aislada. Requiere `DATABASE_TEST_URL` apuntando a PostgreSQL `sig_test` en `127.0.0.1` e `IBITE_DEMO_CAPTURE_KEY` con 64 dígitos hexadecimales. Usa una clave generada localmente y conserva el mismo valor durante la demostración. Puede generarse en PowerShell 7 con:

```powershell
$env:IBITE_DEMO_CAPTURE_KEY = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
npm run start:ibite-demo
```

El comando publica en la salida local la URL, dos campañas ficticias y un token psicosocial sintético de una hora. La demo habilita Swagger en `/docs` y escucha solo en loopback. Para comenzar, usa una campaña del tipo correcto y recibe el token de captura en el POST de inicio. Carga ese token en `sessionToken` de Postman y conserva el `psychosocialToken` para resultados. El proceso conserva las campañas y ventanas al reiniciar. Cada ventana sintética dura un día. Para pruebas automáticas, `./scripts/verify-isolated-db.ps1` crea y retira toda la base desechable.

### Reinicio de proceso verificado

`scripts/verify-ibite-demo.mjs` arranca Node en un puerto efímero, envía un documento ficticio con autorización incierta, consulta la alerta crítica con el token psicosocial y termina el proceso. Inicia un segundo proceso con la misma base y clave. Comprueba que conserva las campañas y que el documento obtiene 409 al intentar enviar otra vez. Los tokens, documentos y claves del ensayo no se imprimen en su resultado.

## Presentar los ítems de referencia

```powershell
npm run start:ibite-demo -- --verified-items
```

En el entorno local `sig_test`, este modo presenta los 17 enunciados de referencia de cada rama y sus opciones verificadas. Cada formulario devuelve su propia `formVersion` de evidencia v2. Para enviar desde Postman, usar el valor devuelto por GET /formulario en vez de la versión sintética prefijada en la colección. Los identificadores sintéticos de pregunta y opción siguen siendo los mismos.

La prueba automática compara las 34 preguntas obtenidas por HTTP con el inventario y verifica que la respuesta solo expone ID y texto de opción. Ejecuta un envío adolescente con autorización incierta, lee la alerta crítica con permiso psicosocial, ejecuta un envío de acudiente con su acuse y repite el envío adolescente después de reiniciar Node. Los casos usan personas, documentos e instituciones de prueba. El modo comparte las campañas ficticias de la demo habitual. El arranque operativo aún requiere integrar el aviso y las secciones de contexto completas.
