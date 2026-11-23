import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  imports: [RouterLink],
  template: `<div class="integration-heading">
      <div>
        <span class="eyebrow">SIG ESCOLAR / MANIZALES</span>
        <h1>Resumen ejecutivo</h1>
        <p>Bienestar escolar y hallazgos institucionales del piloto</p>
      </div>
    </div>
    <section class="card c2-panel">
      <h2>Indicadores del piloto</h2>
      <div class="empty compact">
        <h3>Datos no disponibles</h3>
        <p>Los indicadores agregados requieren una API pública autorizada.</p>
      </div>
    </section>
    <div class="c2-columns">
      <section class="card c2-panel">
        <h2>Componente 2</h2>
        <p>Hallazgos institucionales organizados por áreas y categorías de análisis.</p>
        <a class="button" routerLink="/componente-2">Abrir Componente 2</a>
      </section>
      <section class="card c2-panel">
        <h2>Visor geográfico</h2>
        <p>Consulta las capas públicas y la microzonificación histórica disponible.</p>
        <a class="button" routerLink="/mapa">Abrir visor geográfico</a>
      </section>
    </div>`,
})
export class IntegrationOverviewComponent {}
@Component({
  imports: [RouterLink],
  template: `<div class="integration-heading">
      <div>
        <span class="eyebrow">SIG ESCOLAR / MANIZALES</span>
        <h1>Componente 1</h1>
        <p>Bienestar y seguimiento IBITE</p>
      </div>
    </div>
    <section class="card c2-panel">
      <h2>Integración prevista para una siguiente etapa</h2>
      <p>
        El backend contempla IBITE, MTTS y Fidelidad. Esta entrega comienza con el Componente 2 y el
        visor geográfico.
      </p>
      <a class="button" routerLink="/componente-2">Abrir Componente 2</a>
    </section>`,
})
export class Component1PendingComponent {}
