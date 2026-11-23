import { Component, input } from '@angular/core';
@Component({
  selector: 'app-page-header',
  template: `<div class="page-heading">
    <div>
      <span class="eyebrow">SIG ESCOLAR / MANIZALES</span>
      <h1>{{ title() }}</h1>
      <p>{{ description() }}</p>
    </div>
    <span class="demo-badge"><i></i> Prototipo de interfaz · Datos de demostración</span>
  </div>`,
})
export class PageHeaderComponent {
  title = input('');
  description = input('');
}
@Component({
  selector: 'app-empty-state',
  template: `<div class="empty">
    <span class="empty-icon">—</span>
    <h3>{{ title() }}</h3>
    <p>{{ description() }}</p>
  </div>`,
})
export class EmptyStateComponent {
  title = input('Pendiente de cargar');
  description = input(
    'La información se mostrará cuando se integren y validen las fuentes institucionales.',
  );
}
@Component({ selector: 'app-status-badge', template: `<span class="status">{{ text() }}</span>` })
export class StatusBadgeComponent {
  text = input('Pendiente de cargar');
}
@Component({
  selector: 'app-kpi-card',
  template: `<article class="card kpi">
    <div class="kpi-top">
      <span>{{ label() }}</span
      ><span class="kpi-symbol">{{ symbol() }}</span>
    </div>
    <strong>{{ value() }}</strong
    ><small>{{ note() }}</small>
  </article>`,
})
export class KpiCardComponent {
  label = input('');
  value = input(0);
  note = input('DEMO · cifras ilustrativas');
  symbol = input('↗');
}
