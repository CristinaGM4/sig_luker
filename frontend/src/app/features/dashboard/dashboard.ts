import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';
import { DataService } from '../../core/data.service';
import { PageHeaderComponent, KpiCardComponent, StatusBadgeComponent } from '../../shared/ui';
@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink, PageHeaderComponent, KpiCardComponent, StatusBadgeComponent],
  template: `<app-page-header
      title="Resumen general"
      description="Bienestar psicosocial y condiciones territoriales de las instituciones educativas"
    />
    <div class="filter-bar card">
      <span class="filter-label">Filtrar vista</span
      ><label
        >Institución<select [(ngModel)]="institucion" (ngModelChange)="institutionChanged()">
          <option value="">Todas las instituciones</option>
          @for (i of data.instituciones; track i.id) {
            <option [value]="i.id">{{ i.nombre }}</option>
          }
        </select></label
      ><label
        >Sede<select [(ngModel)]="sede" (ngModelChange)="refresh()">
          <option value="">Todas las sedes demo</option>
          @for (s of availableSedes; track s.id) {
            <option [value]="s.id">{{ s.nombre }}</option>
          }
        </select></label
      ><label
        >Periodo<select [(ngModel)]="periodo" (ngModelChange)="refresh()">
          <option>2026-2</option>
          <option>2026-1</option>
        </select></label
      >
    </div>
    <div class="section-line relative">
      <h2>Una mirada al piloto</h2>
      <span>Periodo {{ periodo }} <b class="demo-text">· DEMO</b></span>
    </div>
    <div class="kpi-grid">
      <app-kpi-card
        label="Instituciones priorizadas"
        [value]="data.instituciones.length"
        note="10 instituciones · alcance del piloto"
        symbol="⌂"
      /><app-kpi-card label="Cuestionarios registrados" [value]="total" symbol="≡" /><app-kpi-card
        label="Alertas que requieren atención"
        [value]="alerts"
        symbol="!"
      /><app-kpi-card
        label="Sedes georreferenciadas"
        [value]="filteredSedes.length"
        note="DEMO · ubicaciones ficticias"
        symbol="⌖"
      />
    </div>
    <div class="charts-grid">
      <section class="card">
        <div class="card-heading">
          <div>
            <h2>Distribución de alertas por nivel</h2>
            <p>Escenario ilustrativo · sin resultados oficiales</p>
          </div>
          <span class="chip">DEMO</span>
        </div>
        <div class="chart">
          <canvas #bars aria-label="Distribución de alertas demo" role="img"></canvas>
        </div>
      </section>
      <section class="card">
        <div class="card-heading">
          <div>
            <h2>Indicadores psicosociales</h2>
            <p>Distribución ilustrativa agregada</p>
          </div>
          <span class="chip">DEMO</span>
        </div>
        <div class="chart">
          <canvas #donut aria-label="Indicadores psicosociales demo" role="img"></canvas>
        </div>
      </section>
    </div>
    <div class="bottom-grid">
      <section class="card">
        <div class="card-heading">
          <div>
            <h2>Instituciones priorizadas</h2>
            <p>Catálogo de referencia del piloto</p>
          </div>
          <a routerLink="/instituciones">Ver todas →</a>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Institución educativa</th>
                <th>Información oficial</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (i of visibleInstituciones; track i.id) {
                <tr>
                  <td>{{ i.nombre }}</td>
                  <td><app-status-badge /></td>
                  <td><a [routerLink]="['/instituciones', i.id]">Ver detalle ↗</a></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
      <a class="map-promo" routerLink="/mapa"
        ><span class="map-glyph">⌖</span><span class="eyebrow">EXPLORA EL TERRITORIO</span>
        <h2>El piloto, en el mapa</h2>
        <p>Explora sedes de demostración y conoce el estado de las capas territoriales.</p>
        <span class="button white">Abrir visor geográfico →</span
        ><small>Cartografía interactiva · OpenStreetMap</small></a
      >
    </div>
    <div class="notice">
      ⓘ Los indicadores mostrados son ilustrativos. Pendiente de integración con fuentes
      institucionales.
    </div>`,
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  data = inject(DataService);
  institucion = '';
  sede = '';
  periodo = '2026-2';
  @ViewChild('bars') bars!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donut') donut!: ElementRef<HTMLCanvasElement>;
  charts: Chart[] = [];
  get availableSedes() {
    return this.data.sedes.filter((s) => !this.institucion || s.institucionId === this.institucion);
  }
  get filteredSedes() {
    return this.availableSedes.filter((s) => !this.sede || s.id === this.sede);
  }
  get records() {
    const ids = this.filteredSedes.map((s) => s.institucionId);
    return this.data.indicadores.filter(
      (i) => i.periodo === this.periodo && ids.includes(i.institucionId),
    );
  }
  get total() {
    return this.records.reduce((n, i) => n + i.cuestionarios, 0);
  }
  get levels() {
    return [0, 1, 2].map((x) => this.records.reduce((n, i) => n + i.alertas[x], 0));
  }
  get alerts() {
    return this.levels.reduce((a, b) => a + b, 0);
  }
  get visibleInstituciones() {
    return this.data.instituciones
      .filter((i) => this.filteredSedes.some((s) => s.institucionId === i.id))
      .slice(0, 5);
  }
  institutionChanged() {
    this.sede = '';
    this.refresh();
  }
  ngAfterViewInit() {
    this.charts = [
      new Chart(this.bars.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Seguimiento', 'Atención', 'Atención prioritaria'],
          datasets: [
            {
              data: this.levels,
              backgroundColor: ['#159a9c', '#efad52', '#df7272'],
              borderRadius: 6,
              barThickness: 40,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#edf1f5' } },
            x: { grid: { display: false } },
          },
        },
      }),
      new Chart(this.donut.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Factor protector · demo', 'Seguimiento · demo', 'Atención · demo'],
          datasets: [
            {
              data: this.distribution(),
              backgroundColor: ['#159a9c', '#2563eb', '#dce8ed'],
              borderWidth: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '74%',
          plugins: { legend: { position: 'right', labels: { boxWidth: 10, padding: 20 } } },
        },
      }),
    ];
  }
  distribution() {
    return [0, 1, 2].map((x) => this.records.reduce((n, i) => n + i.indicadores[x], 0));
  }
  refresh() {
    if (this.charts.length) {
      this.charts[0].data.datasets[0].data = this.levels;
      this.charts[1].data.datasets[0].data = this.distribution();
      this.charts.forEach((c) => c.update());
    }
  }
  ngOnDestroy() {
    this.charts.forEach((c) => c.destroy());
  }
}
