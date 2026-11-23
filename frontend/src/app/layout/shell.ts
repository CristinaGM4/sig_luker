import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Map,
  School,
  ClipboardList,
  Grid2X2,
  Files,
  PanelLeftClose,
  Menu,
} from 'lucide-angular';
@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
  template: `<div class="shell">
    <aside [class.open]="open()">
      <a class="brand" routerLink="/resumen"
        ><span class="brand-mark">S<span>+</span></span>
        <div>SIG Escolar<small>Manizales</small></div></a
      ><span class="nav-label">ESPACIO DE TRABAJO</span>
      <nav>
        @for (item of links; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active" (click)="open.set(false)"
            ><lucide-icon [img]="item.icon" [size]="19" />{{ item.label }}</a
          >
        }
      </nav>
      <div class="sidebar-footer">
        <span class="partner-mark">UM</span>
        <div>Universidad de Manizales<small>Bienestar y territorio escolar</small></div>
      </div>
      <div class="pilot"><i></i> Piloto · Manizales, Colombia</div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <button class="menu-button" aria-label="Abrir navegación" (click)="open.set(!open())">
          <lucide-icon [img]="menu" [size]="20" /></button
        ><span>Proyecto piloto / {{ currentName }}</span>
        <div class="top-right">
          <span class="outline-tag">SIG · INTEGRACIÓN</span><span class="avatar">UM</span>
        </div>
      </header>
      <main><router-outlet /></main>
      <footer>
        Proyecto SIG Escolar · Manizales <span>Bienestar escolar y contexto territorial</span>
      </footer>
    </div>
  </div>`,
})
export class AppShellComponent {
  router = inject(Router);
  get currentName() {
    return (
      this.links.find((l) => this.router.url.startsWith(l.path))?.label ?? 'Página no encontrada'
    );
  }
  open = signal(false);
  menu = Menu;
  links = [
    { path: '/resumen', label: 'Resumen ejecutivo', icon: LayoutDashboard },
    { path: '/componente-1', label: 'Componente 1', icon: School },
    { path: '/componente-2', label: 'Componente 2', icon: ClipboardList },
    { path: '/mapa', label: 'Visor geográfico', icon: Map },
  ];
}
