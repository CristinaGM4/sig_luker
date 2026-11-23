# Control interno de campañas IBITE-17

DF-17 · R01/R02/R12.

`PUT /api/v1/interno/campanas-ibite/{campanaId}/estado` recibe `{"enabled":true}` para habilitar o `{"enabled":false}` para pausar. Requiere sesión vigente, el permiso `ibite:campaign-control` y pertenencia explícita a la institución de la campaña. El catálogo crea el permiso para aprovisionamiento autorizado. La migración no otorga permisos ni cambia ventanas. El permiso se asignará a la cuenta institucional validada del operador designado, con las diez instituciones del piloto.

El control se aplica a IBITE-17. La ventana del Periodo 2 sigue siendo el límite de captura. Habilitar una campaña permite operar cuando su ventana está abierta. Pausar bloquea nuevas consultas de habilitación y envíos del respondiente, incluidas negativas. Las aplicaciones definitivas permanecen consultables bajo los permisos psicosociales existentes. La operación se serializa frente a los envíos y las negativas en curso. La actualización y el evento de auditoría se escriben juntos.

| Estado HTTP | Condición |
|---|---|
| 204 | Estado aplicado o ya vigente. Repetir el mismo estado no duplica la auditoría. |
| 400 | UUID inválido, valor no booleano o campos adicionales. |
| 401 | Sesión inválida o ausente. |
| 403 | Sesión válida sin permiso de operación. |
| 404 | Campaña inexistente, fuera del ámbito institucional o de otro instrumento. |

La colección Postman habitual incluye el PUT. El cierre del piloto todavía requiere aprovisionar la cuenta operativa y las campañas. El backend actual no incluye habilitación masiva administrativa por HTTP.
