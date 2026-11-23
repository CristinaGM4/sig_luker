import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/shell';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  imports: [RouterLink],
  template:
    '<div class="empty"><h1>404</h1><h2>Página no encontrada</h2><p>La dirección solicitada no está disponible.</p><a class="button" routerLink="/dashboard">Volver al resumen</a></div>',
})
class NotFoundComponent {}
export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'componente-2' },
      {
        path: 'componente-2',
        loadComponent: () =>
          import('./features/componente-2/componente-2').then((m) => m.Componente2Component),
      },
      {
        path: 'resumen',
        loadComponent: () =>
          import('./features/integracion/overview').then((m) => m.IntegrationOverviewComponent),
      },
      {
        path: 'componente-1',
        loadComponent: () =>
          import('./features/integracion/overview').then((m) => m.Component1PendingComponent),
      },
      {
        path: 'demo/mapa',
        loadComponent: () => import('./features/mapa/mapa').then((m) => m.MapaComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'mapa',
        loadComponent: () => import('./features/mapa/public-map').then((m) => m.PublicMapComponent),
      },
      {
        path: 'instituciones',
        loadComponent: () =>
          import('./features/instituciones/instituciones').then((m) => m.InstitucionesComponent),
      },
      {
        path: 'instituciones/:id',
        loadComponent: () =>
          import('./features/instituciones/instituciones').then(
            (m) => m.InstitucionDetalleComponent,
          ),
      },
      {
        path: 'fichas-campo',
        loadComponent: () =>
          import('./features/fichas-campo/fichas').then((m) => m.FichasComponent),
      },
      {
        path: 'criticidad',
        loadComponent: () =>
          import('./features/criticidad/criticidad').then((m) => m.CriticidadComponent),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reportes/reportes').then((m) => m.ReportesComponent),
      },
      { path: '**', component: NotFoundComponent },
    ],
  },
];
