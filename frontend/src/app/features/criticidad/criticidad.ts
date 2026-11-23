import { Component, inject } from '@angular/core';
import { DataService } from '../../core/data.service';
import { PageHeaderComponent } from '../../shared/ui';
@Component({
  selector: 'app-criticidad',
  imports: [PageHeaderComponent],
  template: `<app-page-header
      title="Matriz de criticidad"
      description="Vista de integración de las dimensiones de bienestar y gestión del riesgo"
    />
    <div class="method-card">
      <span class="chip">Pendiente de validación metodológica</span>
      <h2>Una lectura integral, con criterios validados</h2>
      <p>
        Los criterios, ponderaciones y puntos de corte deben ser aprobados por el equipo técnico
        responsable.
      </p>
      <p>
        Esta vista muestra la estructura prevista. No se han calculado índices, puntuaciones ni
        niveles de criticidad.
      </p>
    </div>
    <section class="card">
      <div class="card-heading">
        <h2>Dimensiones por institución</h2>
        <span class="muted">10 instituciones · 6 dimensiones</span>
      </div>
      <div class="table-wrap">
        <table class="matrix">
          <thead>
            <tr>
              <th>Institución educativa</th>
              @for (d of data.dimensiones; track d.id) {
                <th>{{ d.nombre }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (i of data.instituciones; track i.id) {
              <tr>
                <td class="strong">{{ i.nombre }}</td>
                @for (d of data.dimensiones; track d.id) {
                  <td><span class="placeholder">—</span><small>Pendiente</small></td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
    <div class="notice">
      Los guiones representan información pendiente; no equivalen a cero ni a ausencia de riesgo.
    </div>`,
})
export class CriticidadComponent {
  data = inject(DataService);
}
