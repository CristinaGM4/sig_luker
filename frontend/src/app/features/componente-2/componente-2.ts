import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PUBLIC_INSTITUTIONS } from '../../core/api/public-institutions';
import { AREAS } from './taxonomy';
@Component({
  imports: [FormsModule, RouterLink],
  template: `<div class="integration-heading">
      <div>
        <span class="eyebrow">SIG ESCOLAR / MANIZALES</span>
        <h1>Componente 2</h1>
        <p>Hallazgos institucionales de directivos, docentes y personal administrativo</p>
      </div>
      <span class="integration-badge">Integración en desarrollo</span>
    </div>
    <div class="notice integration-notice">
      <strong>Hallazgos pendientes de integración</strong>
      <p>
        La estructura temática sigue el diseño suministrado. Los registros, las recomendaciones y
        las estadísticas requieren servicios del backend.
      </p>
    </div>
    <div class="filter-bar card">
      <label
        >Institución educativa<select
          [ngModel]="institution()"
          (ngModelChange)="institution.set($event)"
        >
          <option value="">Todas las instituciones del piloto</option>
          @for (i of institutions; track i.id) {
            <option [value]="i.id">{{ i.name }}</option>
          }
        </select></label
      ><label
        >Área de análisis<select [(ngModel)]="area">
          <option value="">Todas las áreas</option>
          @for (a of areas; track a.name) {
            <option [value]="a.name">{{ a.name }}</option>
          }
        </select></label
      ><span class="muted">{{ institution() ? 'Vista individual' : 'Vista consolidada' }}</span>
    </div>
    <div class="c2-kpis">
      <article class="card">
        <p>Instituciones disponibles</p>
        <strong>{{ institution() ? 1 : institutions.length }}</strong>
        <small>Catálogo de referencia del piloto</small>
      </article>
      <article class="card">
        <p>Hallazgos registrados</p>
        <strong>—</strong><small>Datos no disponibles</small>
      </article>
      <article class="card">
        <p>Recomendaciones registradas</p>
        <strong>—</strong><small>Datos no disponibles</small>
      </article>
    </div>
    <section class="card c2-panel">
      <div class="section-line">
        <div>
          <h2>Estadísticas de hallazgos</h2>
          <p>Distribución por categoría</p>
        </div>
        <span class="chip">Pendiente de API</span>
      </div>
      <div class="empty compact">
        <h3>Datos no disponibles</h3>
        <p>
          Las frecuencias y porcentajes se mostrarán cuando exista una fuente institucional
          validada.
        </p>
      </div>
    </section>
    <div class="c2-columns">
      <section class="card c2-panel">
        <div class="section-line">
          <div>
            <h2>
              {{
                institution() ? 'Hallazgos de la institución' : 'Coincidencias entre instituciones'
              }}
            </h2>
            <p>Categorías previstas para la consulta</p>
          </div>
        </div>
        @for (a of visibleAreas; track a.name) {
          <details class="theme-group">
            <summary>
              {{ a.name }}
              <span
                >{{ a.categories.length }}
                {{ a.categories.length === 1 ? 'categoría' : 'categorías' }}</span
              >
            </summary>
            <p>{{ a.description }}</p>
            @for (c of a.categories; track c.name) {
              <div class="category-row">
                <div>
                  <h3>{{ c.name }}</h3>
                  @if (c.dimension) {
                    <small>{{ c.dimension }}</small>
                  }
                </div>
                <span>Sin registros disponibles</span>
              </div>
            }
          </details>
        }
      </section>
      <section class="card c2-panel c2-aside">
        <h2>Recomendaciones vinculadas</h2>
        <div class="empty compact">
          <h3>Datos no disponibles</h3>
          <p>Pendientes del servicio de hallazgos y recomendaciones.</p>
        </div>
        <div class="scope-note">
          <h3>Consulta territorial</h3>
          <p>Explora las capas que publique el backend y sus metadatos.</p>
          <a class="button secondary" routerLink="/mapa">Abrir visor geográfico</a>
        </div>
      </section>
    </div>
    <section class="card c2-panel">
      <h2>Fichas de campo</h2>
      <p>
        La carga Excel está pendiente del contrato REST de recepción, validación y persistencia.
      </p>
      <button class="button secondary" disabled>Carga pendiente de integración</button
      ><small>Formato esperado pendiente de especificación por el backend.</small>
    </section>`,
})
export class Componente2Component {
  private route = inject(ActivatedRoute);
  readonly institutions = PUBLIC_INSTITUTIONS;
  readonly areas = AREAS;
  area = '';
  institution = signal('');
  constructor() {
    const requested = this.route.snapshot.queryParamMap.get('institucion');
    if (requested && this.institutions.some((item) => item.id === requested))
      this.institution.set(requested);
  }
  get visibleAreas() {
    return this.areas.filter((area) => !this.area || area.name === this.area);
  }
}
