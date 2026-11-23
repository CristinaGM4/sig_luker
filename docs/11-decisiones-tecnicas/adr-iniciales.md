# Decisiones pendientes

| ADR | Propuesta | Alternativas y criterio de cierre |
|---|---|---|
| ADR-01 | Monolito modular en NestJS con Express | Express directo da menor estructura y exige convenciones propias. Fastify directo o como adaptador ofrece otra integración multipart. Validar compatibilidad, complejidad operativa y perfil de carga |
| ADR-02 | Código individual de un solo uso para acceso esporádico, con sesión revocable; credencial dedicada para personal según política | Código reduce fricción de memoria y depende de un canal de distribución seguro. Contraseña inicial aleatoria exige activación, hash robusto y recuperación; SSO reduce gestión local si existe proveedor. Validar canal, caducidad, revocación, recuperación, abuso y necesidades de segundo factor |
| ADR-03 | PostGIS con extensión Prisma si cubre las consultas seleccionadas | DDL y SQL parametrizado encapsulado cubren operaciones no expuestas con mayor coste de mantenimiento. Probar creación desde cero, migración repetible, punto/polígono, filtro, reproyección e índice |
| ADR-04 | Custodia y ámbito explícitos por acción y conjunto de datos | Confirmar qué entidad conserva la correspondencia de identidad y si backend/tallero se integran con Censo Digital o pertenecen a un alcance distinto |
| ADR-05 | Campaña semestral y retamizaje focalizado como contextos candidatos | Aprobar definición de cohorte, unidad de conteo, línea base y vínculo longitudinal antes del contrato |
| ADR-06 | MVP acotado a identidad, catálogos y ciclo IBITE verificable | Confirmar población inicial, exclusiones funcionales, fuentes y fecha viable antes de asignar implementación |

ADR-02 cuenta con un [borrador de habilitación a campañas](../05-contratos-api/ibite-habilitacion.md). El mecanismo de entrega y el rol habilitador siguen pendientes de aprobación.

## ADR-01 aprobado

El usuario aprobó la apertura de la implementación y NestJS con Express. El primer incremento usa NestJS 12.6.0, Swagger 12.1.2 y TypeScript 5.9.3, con módulos ESM y dependencias fijadas mediante npm. Se verificó la compatibilidad en el runtime local. El monolito modular se mantiene como estructura de la propuesta. ADR-03 de persistencia sigue pendiente de validación con PostgreSQL/PostGIS.

ADR-03: propuesta actualizada a Prisma ORM 7.10.1 estable y PostGIS 3.7. La extensión Prisma 8 sigue en versión candidata. Consultar el [entorno de datos](../03-arquitectura/entorno-datos.md) y mantener pendiente la prueba contra PostgreSQL/PostGIS y la aprobación del esquema inicial.

## Decisiones del corte autónomo del 20 de noviembre de 2026

- **Puntuación y orientaciones, R04.** Conservar salidas de referencia como códigos calculados y usar la clave de Excel para auditoría de reproducción. Se aplaza la distribución de mensajes, infografías o rutas hasta confirmar contenido y vigencia. Cada referencia registra instrumento, variante, versión de regla y huella de fuente.
- **Persistencia acotada, R02/R04.** La migración de catálogo declara dos instrumentos y permite registrar sus tres variantes confirmadas. La semilla considera inmutables los metadatos de una clave existente y rechaza discrepancias. Las aplicaciones y su resultado dependen de las reglas de identidad, elegibilidad, vinculación y captura.
- **Disponibilidad, R12/R13.** La comprobación de PostgreSQL se separa de la vida del proceso. La respuesta pública de disponibilidad se limita al estado técnico.
- **Pruebas aisladas.** Ensayar migraciones desde cero en un contenedor desechable distinto de sig_test habitual, con datos sintéticos y sin reiniciar bases existentes.

Consulta operativa: mantener truncated en auditoría/resultados y añadir nextCursor compatible. La continuación usa fecha y UUID y verifica ámbito en servidor. Supresión de ejemplo con umbral explícito y total retenido, sin efecto sobre la política de publicación.

Idempotencia IBITE: almacenar dos huellas en la aplicación y recuperar el ID dentro de la habilitación autorizada. Capturar un conflicto de unicidad permite releer el envío concurrente sin duplicar resultados ni auditoría. La clave de comparación ortográfica de instituciones genera sugerencias, no asignaciones.

La reproducción interna de aplicaciones usa el cálculo existente con la versión original y el ámbito psicosocial revalidado. Se audita el acceso y no se agregan resultados. El diagnóstico histórico versión 2 conserva coordenadas sin origen resoluble. La verificación limpia usa proyecto Compose y puerto efímeros.
