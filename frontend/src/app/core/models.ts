export interface Institucion {
  id: string;
  nombre: string;
  dane: string | null;
  direccion: string | null;
}
export interface SedeEducativa {
  id: string;
  institucionId: string;
  nombre: string;
  lat: number;
  lng: number;
  demo: true;
}
export interface IndicadorPsicosocialAgregado {
  institucionId: string;
  periodo: string;
  cuestionarios: number;
  alertas: number[];
  indicadores: number[];
}
export interface HallazgoTerritorial {
  codigo: string;
  descripcion: string;
  categoria: string;
  lugar: string;
  fuente: string;
}
export interface FichaCampo {
  codigo: string;
  fecha: string;
  institucionId: string;
  sedeId: string;
  tipo: string;
  observaciones: string;
  hallazgos: HallazgoTerritorial[];
  estado: string;
}
export interface CapaGeografica {
  nombre: string;
  disponible: boolean;
  descripcion: string;
}
export interface DimensionCriticidad {
  id: string;
  nombre: string;
}
