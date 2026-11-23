# Verificación del incremento de Componente 2 y SIG

Fecha 23 de noviembre de 2026. Backend de referencia `macardonama/sig_luker`, commit `d7fea67`.

## Fuentes y trazabilidad

- Solicitud de la usuaria de priorizar Componente 2 y visor geográfico.
- `PROMPT_IMPLEMENTACION_FRONTEND.md` suministrado, utilizado como referencia de integración. Sus flujos IBITE, MTTS, Fidelidad y administración quedan para etapas posteriores al alcance solicitado.
- Diseño HTML suministrado, del cual se reconstruyeron estructura y taxonomía mediante Angular. No se incrusta ni ejecuta el documento.
- `src/geo/microzonification.controller.ts`, `src/geo/institution-points.controller.ts`, `src/auth/auth.controller.ts`, `docs/05-contratos-api/sig-microzonificacion.md` y `catalogos-internos.md` del backend.

## Resultados ejecutados

- Build Angular de producción correcto y plantillas strict compiladas.
- Siete pruebas automatizadas correctas de paginación completa, catálogo vacío, cursor repetido, cancelación con reinicio de cursor, límites de envío Bearer, validación de featuresPath y mensajes de acceso/errores.
- Backend descargado, `npm ci` y `npm run build` correctos, sin cambios a sus fuentes.
- Backend NestJS iniciado sin base configurada. GET directo y a través del proxy Angular a `/api/v1/health` devuelve `{"status":"ok"}`.
- `/docs-json` de esa instancia contiene solo salud, conforme al registro condicional de módulos sin DATABASE_URL. GET de capas devuelve 404. No se confunde con un catálogo vacío.
- Navegador con Componente 2 real. Filtro Cuidado socioemocional deja un grupo y permite desplegar su categoría. Selección institucional deshabilitada sin sesión. Carga Excel deshabilitada.
- Navegador con API sintética aislada en 3001 y Angular QA en 4201. Se renderizaron dos páginas GeoJSON, leyenda y fuente. Sesión temporal verificada, catálogo institucional cargado, punto visible y selección con popup y detalle. El enlace al Componente 2 conserva el UUID seleccionado tras volver a consultar catálogo autorizado. Cerrar sesión limpia el catálogo y deshabilita la consulta.
- Escenarios sintéticos de catálogo vacío y capa sin entidades mostraron mensajes distintos correctamente.
- Se detectó y corrigió en la prueba manual el envío nativo del formulario temporal. Ahora usa FormGroup reactivo y no recarga la aplicación.
- Consola observada durante el flujo sintético de sesión, punto y navegación, sin errores JavaScript.

## Pendientes verificables con Mate

- Verificación completa con PostgreSQL/PostGIS, migraciones, capa importada y sesión aprovisionada. Docker no estaba disponible en PATH en este equipo.
- Comparación con `/docs-json` de una instancia con base configurada. Los tipos se basan en contratos y controladores versionados, no en una instancia completa activa.
- Pruebas reales de permisos por institución y vencimiento. Se implementa limpieza ante 401, y el backend decide el alcance.
- API de hallazgos, recomendaciones, coincidencias, estadísticas y carga Excel de Componente 2.
- Autenticación productiva. El panel temporal solo está en desarrollo.

Las geometrías de QA y su token fijo son sintéticos y permanecen en el fixture aislado. El frontend normal consulta el backend en 3000. No se importaron datos personales ni se modificó la base de Mate.

## Corrección de acceso público solicitada por la usuaria

Componente 2 y visor se consultan sin sesión. Se retiró el panel de token del shell y las consultas privadas de ambas vistas. Sus filtros usan el catálogo local de referencia con los diez nombres suministrados, sin coordenadas inventadas ni UUID oficiales. Las ubicaciones están pendientes de una fuente pública.

En el navegador se seleccionó IE La Sultana en el visor y se abrió el Componente 2 con esa selección, sin token. El selector institucional estaba habilitado y la consola observada no mostró errores JavaScript. Se agregó una octava prueba para impedir que los errores de las capas públicas soliciten sesión. La integración con la base real de Mateo permanece pendiente.

## Integración real completada después del arranque en Terminal

Se instaló PostgreSQL 17.12 con PostGIS 3.5 mediante la distribución oficial de Postgres.app. La copia instalada supera la verificación estricta de firma. Las credenciales generadas se conservan en archivos locales protegidos y el .env del backend está excluido de Git.

La usuaria ejecutó el lanzador local desde Terminal, donde se aplicaron las migraciones, catálogos y la importación oficial de 139 entidades. El archivo GeoJSON del repositorio usa LF y la huella revisada está calculada con CRLF. Se creó una copia de importación con CRLF sin modificar el JSON ni el original, comprobando la huella esperada antes de --plan y --apply.

Comprobaciones posteriores exitosas mediante herramientas y navegador

- PostgreSQL responde y reporta PostGIS habilitado. Tabla microzonification_zones con 139 filas.
- Ready devuelve ready tanto en 3000 como a través del proxy en 4200.
- Catálogo devuelve microzonificacion-2002, leyenda A/B/P/T y metadatos históricos de 2002.
- Consulta GeoJSON por proxy recupera 139 IDs únicos en siete páginas y geometrías MultiPolygon.
- Leaflet muestra 139 polígonos, doce teselas base cargadas y el mensaje de 139 entidades consultadas en el área visible. Consola observada sin errores.
- Visor público abre sin sesión.

Los pendientes de conexión a base y cartografía de las secciones históricas anteriores quedan resueltos por esta comprobación. Permanecen pendientes los servicios públicos de hallazgos del Componente 2 y las coordenadas institucionales públicas.

## Sedes públicas conectadas

El backend actualizado usa el puerto 3002, configurado en proxy.conf.json, y publica GET /api/v1/publico/sig/instituciones. La instancia anterior en 3000 se conserva sin cambios. Se importaron 21 puntos a la base, manteniendo los campos originales y publicando solo identificadores institucionales, nombres, coordenadas y observaciones de asociación. Siete códigos principales están pendientes de validación. El cruce con las diez instituciones de referencia se hace por nombre para navegación, señalado explícitamente en la respuesta.

Se comprobaron 21 puntos en Leaflet, tres sedes al filtrar Fe y Alegría La Paz, ocultar/mostrar capa, popup, detalle y navegación al Componente 2 con institución seleccionada. La microzonificación continúa activa. No se rellenaron estadísticas ni hallazgos pendientes.

El backend incluye migración, importador idempotente, contrato, colección Postman y tres pruebas específicas exitosas (DTO público, colección vacía, HTTP sin token y protección interna). Build de ambos proyectos correcto.
