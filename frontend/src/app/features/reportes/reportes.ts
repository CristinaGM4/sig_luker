import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui';
@Component({
  selector: 'app-reportes',
  imports: [PageHeaderComponent],
  template: `<app-page-header
      title="Reportes"
      description="Productos de consulta y síntesis para el equipo del proyecto"
    />
    <div class="reports-grid">
      @for (r of reports; track r.title) {
        <article class="card report">
          <span class="report-icon">{{ r.icon }}</span
          ><span class="chip">{{ r.status }}</span>
          <h2>{{ r.title }}</h2>
          <p>{{ r.description }}</p>
          <div class="report-bottom">
            <button class="button secondary" disabled>Exportación no disponible</button
            ><small>{{ r.reason }}</small>
          </div>
        </article>
      }
    </div>
    <div class="notice">
      Los reportes estarán disponibles después de integrar las fuentes y validar los criterios
      técnicos. El prototipo no genera documentos con datos oficiales.
    </div>`,
})
export class ReportesComponent {
  reports = [
    {
      title: 'Mapa por sede',
      icon: '⌖',
      status: 'Pendiente de integración',
      description: 'Localización y contexto territorial de cada sede educativa.',
      reason: 'Pendiente de coordenadas oficiales y capas territoriales.',
    },
    {
      title: 'Informe de indicadores IBITE',
      icon: '▥',
      status: 'Pendiente de integración',
      description: 'Síntesis agregada de los indicadores psicosociales del instrumento IBITE-17.',
      reason: 'Pendiente de fuentes institucionales agregadas y validadas.',
    },
    {
      title: 'Matriz de criticidad',
      icon: '▦',
      status: 'En preparación',
      description: 'Lectura conjunta de las seis dimensiones de análisis.',
      reason: 'Pendiente de validación metodológica.',
    },
    {
      title: 'Consolidado de hallazgos',
      icon: '≡',
      status: 'En preparación',
      description: 'Resumen territorial de los registros de campo del proyecto.',
      reason: 'Pendiente de integración, validación y persistencia de registros.',
    },
  ];
}
