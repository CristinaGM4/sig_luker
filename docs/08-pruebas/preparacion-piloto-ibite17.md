# Preparación del Periodo 2 IBITE-17

DF-10, DF-13 y DF-17. El comprobador lee la configuración confirmada del piloto y consulta el catálogo de una base local de pruebas. Revisa el periodo, sus fechas, las diez instituciones, las referencias de instrumento y las campañas existentes. Hay veinte combinaciones técnicas, una por cada rama de cada institución.

```powershell
npm run build
npm run plan:ibite-pilot -- CODIGO_DEL_PERIODO
npm run plan:ibite-pilot -- CODIGO_DEL_PERIODO UUID_DEL_OPERADOR_SINTETICO
```

Requiere `DATABASE_TEST_URL` para `sig_test` en `127.0.0.1`. El segundo argumento es opcional. Cuando se entrega, comprueba que la cuenta esté activa, tenga el permiso `ibite:campaign-control` y tenga alcance sobre cada institución. Si se omite, `operatorChecked` queda en falso. El resultado no muestra el identificador del operador.

El JSON identifica campañas pendientes, compatibles o en conflicto. Una institución sin coincidencia por nombre, inactiva o con coincidencias múltiples se reporta para revisión. Las campañas existentes no se modifican. Una pausa existente se refleja en `enabled`. El código de salida es 0 si la preparación no detectó bloqueos, 2 si los detectó y 1 ante error de configuración o ejecución. El código 0 por sí solo no implica que todas las campañas estén provisionadas.

El ensayo automatizado comprueba 20 combinaciones para diez instituciones ficticias, fechas y versiones, detección de conflictos, estado de pausa y alcance parcial del operador. El comprobador se ejecuta además contra la base desechable con un periodo inexistente para verificar la salida de bloqueo.

Pendiente: correr la validación con un catálogo institucional autorizado en el entorno de prueba, cargar la cuenta operativa y completar la captura oficial. La herramienta actual no provisiona ni activa campañas.

## Revisión previa al despliegue

Con `IBITE_PLAN_DATABASE_URL` en el entorno, ejecutar `npm run plan:ibite-pilot -- CODIGO_PERIODO UUID_OPERADOR --deployment-plan`. Se requiere el identificador de la cuenta designada. La consulta usa una transacción de solo lectura con una vista estable de instituciones, versiones, campañas y permisos. Un bloqueo produce código 2. El plan no crea campañas ni concede permisos.

