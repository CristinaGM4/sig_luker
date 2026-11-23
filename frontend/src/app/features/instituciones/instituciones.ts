import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent } from '../../shared/ui';
@Component({
  selector: 'app-instituciones',
  imports: [FormsModule, RouterLink, PageHeaderComponent, StatusBadgeComponent],
  template: `<app-page-header
      title="Instituciones educativas"
      description="Catálogo de referencia de las diez instituciones priorizadas en el piloto"
    />
    <div class="filter-bar card">
      <label class="grow"
        >Buscar institución<input
          [(ngModel)]="query"
          placeholder="Buscar por nombre de institución…" /></label
      ><label
        >Disponibilidad de información<select [(ngModel)]="estado">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente de cargar</option>
          <option value="completo">Información completa</option>
        </select></label
      ><span class="muted">{{ filtered.length }} instituciones</span>
    </div>
    <section class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Institución educativa</th>
              <th>Código DANE</th>
              <th>Dirección oficial</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (i of filtered; track i.id) {
              <tr>
                <td class="strong">{{ i.nombre }}</td>
                <td>Pendiente de cargar</td>
                <td>Pendiente de cargar</td>
                <td><app-status-badge /></td>
                <td><a [routerLink]="['/instituciones', i.id]">Ver detalle →</a></td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5">No se encontraron instituciones con estos filtros.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
    <div class="notice">
      Los nombres constituyen el catálogo de referencia. No se incluyen matrículas, resultados IBITE
      ni ubicaciones oficiales.
    </div>`,
})
export class InstitucionesComponent {
  data = inject(DataService);
  query = '';
  estado = '';
  get filtered() {
    return this.data.instituciones.filter(
      (i) =>
        i.nombre.toLocaleLowerCase('es').includes(this.query.toLocaleLowerCase('es')) &&
        this.estado !== 'completo',
    );
  }
}
@Component({
  selector: 'app-institucion-detalle',
  imports: [RouterLink, PageHeaderComponent, EmptyStateComponent],
  template: `<a class="back" routerLink="/instituciones">← Volver a instituciones</a>
    @if (institucion) {
      <app-page-header
        [title]="institucion.nombre"
        description="Ficha institucional · Catálogo de referencia del piloto"
      />
      <div class="tabs" role="tablist">
        @for (t of tabs; track t) {
          <button
            role="tab"
            [attr.aria-selected]="tab === t"
            [class.active]="tab === t"
            (click)="tab = t"
          >
            {{ t }}
          </button>
        }
      </div>
      <section class="card detail-panel">
        @if (tab === 'Información general') {
          <h2>Información general</h2>
          <div class="info-grid">
            <div>
              <small>Nombre</small><strong>{{ institucion.nombre }}</strong>
            </div>
            <div><small>Código DANE</small><strong>Pendiente de cargar</strong></div>
            <div><small>Dirección oficial</small><strong>Pendiente de cargar</strong></div>
            <div><small>Matrícula</small><strong>Pendiente de cargar</strong></div>
          </div>
        } @else if (tab === 'Hallazgos') {
          <app-empty-state
            title="Sin hallazgos institucionales validados"
            description="Las fichas DEMO en memoria no constituyen hallazgos oficiales."
          />
        } @else {
          <app-empty-state
            [title]="
              tab === 'Indicadores IBITE'
                ? 'Indicadores IBITE pendientes de integrar'
                : 'Fuentes territoriales pendientes de integrar'
            "
          />
        }
      </section>
    } @else {
      <app-empty-state title="Institución no encontrada" />
    }`,
})
export class InstitucionDetalleComponent {
  data = inject(DataService);
  route = inject(ActivatedRoute);
  get institucion() {
    return this.data.instituciones.find((i) => i.id === this.route.snapshot.paramMap.get('id'));
  }
  tabs = ['Información general', 'Indicadores IBITE', 'Condiciones territoriales', 'Hallazgos'];
  tab = this.tabs[0];
}
