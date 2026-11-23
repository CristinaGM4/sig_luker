import { Injectable, signal } from '@angular/core';
import { INSTITUCIONES, SEDES, INDICADORES, CAPAS, DIMENSIONES } from '../mock-data/demo';
import { FichaCampo } from './models';
@Injectable({ providedIn: 'root' })
export class DataService {
  readonly instituciones = INSTITUCIONES;
  readonly sedes = SEDES;
  readonly indicadores = INDICADORES;
  readonly capas = CAPAS;
  readonly dimensiones = DIMENSIONES;
  readonly fichas = signal<FichaCampo[]>([]);
  nombre(id: string) {
    return this.instituciones.find((i) => i.id === id)?.nombre ?? 'Pendiente de cargar';
  }
  agregar(ficha: FichaCampo) {
    this.fichas.update((items) => [ficha, ...items]);
  }
}
