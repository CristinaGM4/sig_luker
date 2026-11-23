# Verificación de la base HTTP

T01, parte HTTP. Node.js 22.14.0, npm 11.1.0 y NestJS 12.6.0 con Express.

| Comprobación final | Resultado |
|---|---|
| npm test | 4 aprobadas, 0 fallidas. Configuración válida e inválida, arranque con error, salud y 404, y Swagger/OpenAPI habilitado o desactivado |
| npm run lint | Aprobada |
| npm run format:check | Aprobada |
| npm audit --omit=dev | 0 vulnerabilidades reportadas por el registro npm durante la verificación |
| Archivos Postman | JSON válido. La ruta está verificada por pruebas HTTP automatizadas; la colección no se ejecutó en Postman |
| Docker | CLI y Compose disponibles; el motor local no respondió. Persistencia, migraciones y pruebas de PostgreSQL/PostGIS quedan pendientes |

El primer intento de compilación detectó que NestJS 12 requiere imports ESM en esta configuración y que faltaban los tipos de Express. Se ajustaron ambos puntos y se volvió a ejecutar el conjunto de pruebas. Los casos de integración levantan el servicio en puertos locales efímeros y cierran el proceso de prueba.
