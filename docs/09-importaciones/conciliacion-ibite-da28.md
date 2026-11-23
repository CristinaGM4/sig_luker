# Conciliación histórica de IBITE-DA-28

Fuente local: IBITE DA (Manizales) (respuestas).xlsx. Huella SHA-256: 9cf23fe0adc3192d4884d972b1a7b01aac16af5402323e1e333ce0be3a0faa25. Inspección de solo lectura con el perfil DA-28, sin registrar datos personales. El catálogo de esta variante es Catalogo_Instituciones, y H es la columna institucional. Se revisaron cuatro anclajes de contexto y las referencias de los 28 ítems. Las fórmulas se analizaron como texto.

| Medida | Resultado |
|---|---:|
| Filas con respuestas | 630 |
| Filas con fórmulas de puntuación | 1.953 |
| Fórmulas con origen vacío o ausente | 1.323 |
| Filas con anclajes internos incompatibles | 0 |
| Coordenadas de origen repetidas | 1 |
| Referencias repetidas a un origen con datos | 0 |

INC-IBITE-02: Puntuaciones 1000 y 1001 remiten a la coordenada 1228 del formulario. La coordenada no contiene una respuesta en la copia analizada. Las 1.323 referencias vacías incluyen ambas. Esta conclusión se limita al archivo identificado por su huella. El registro debe conservar referencias y el custodio debe validar el corte y la correspondencia antes de importar.

El diagnóstico directo dejó 75 filas para revisión institucional: 13 con alias ambiguo, 24 sin institución y 38 sin alias. Se detectaron 149 filas incompletas en el catálogo y 113 etiquetas de destino distintas. Las equivalencias no se aplicaron al archivo.

```powershell
npm run build
python scripts/diagnose-ibite-manizales.py --profile da28 "ruta-local-al-libro-DA.xlsx"
```

La guía del [extractor local](conciliacion-ibite-manizales.md) documenta la dependencia de Python. El perfil predeterminado permanece en IBITE-17.
