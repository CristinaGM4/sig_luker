import {
  Institucion,
  SedeEducativa,
  IndicadorPsicosocialAgregado,
  CapaGeografica,
  DimensionCriticidad,
} from '../core/models';
const nombres = [
  'IE Fe y Alegría La Paz',
  'IE Colegio de Cristo',
  'IE Escuela Normal Superior de Manizales',
  'IE La Asunción',
  'IE Liceo Mixto Sinaí',
  'IE Bosques del Norte',
  'IE La Sultana',
  'IE San Pío X',
  'IE Instituto Latinoamericano',
  'IE Instituto Técnico Francisco José de Caldas',
];
export const INSTITUCIONES: Institucion[] = nombres.map((nombre, i) => ({
  id: String(i + 1),
  nombre,
  dane: null,
  direccion: null,
}));
const puntos = [
  [5.068, -75.518],
  [5.065, -75.51],
  [5.061, -75.502],
  [5.059, -75.492],
  [5.055, -75.483],
  [5.073, -75.501],
  [5.067, -75.483],
  [5.053, -75.512],
  [5.048, -75.496],
  [5.077, -75.49],
];
export const SEDES: SedeEducativa[] = puntos.map(([lat, lng], i) => ({
  id: 's' + (i + 1),
  institucionId: String(i + 1),
  nombre: 'Sede demo ' + String(i + 1).padStart(2, '0'),
  lat,
  lng,
  demo: true,
}));
export const INDICADORES: IndicadorPsicosocialAgregado[] = INSTITUCIONES.flatMap((it, i) =>
  ['2026-1', '2026-2'].map((periodo, j) => ({
    institucionId: it.id,
    periodo,
    cuestionarios: 34 + i * 7 + j * 4,
    alertas: [3 + (i % 3), 2 + (i % 2), 1 + (i % 3)],
    indicadores: [12 + i, 8 + (i % 4), 5 + (i % 3)],
  })),
);
export const CAPAS: CapaGeografica[] = [
  {
    nombre: 'Sedes educativas',
    disponible: true,
    descripcion: 'Ubicaciones ficticias de demostración',
  },
  {
    nombre: 'Microzonificación sísmica',
    disponible: false,
    descripcion: 'Pendiente de recibir datos',
  },
  { nombre: 'Censo estructural', disponible: false, descripcion: 'Pendiente de recibir datos' },
  { nombre: 'Hallazgos de campo', disponible: false, descripcion: 'Pendiente de integrar' },
];
export const DIMENSIONES: DimensionCriticidad[] = [
  'Afectación psicosocial',
  'Afectación física',
  'Percepción de seguridad',
  'Exposición territorial',
  'Funcionamiento escolar',
  'Capacidad de respuesta institucional',
].map((nombre, i) => ({ id: String(i), nombre }));
