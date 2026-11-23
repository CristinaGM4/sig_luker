import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { DataService } from '../../core/data.service';
import { SedeEducativa } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui';
@Component({
  selector: 'app-mapa',
  imports: [FormsModule, RouterLink, PageHeaderComponent],
  template: `<app-page-header
      title="Visor geográfico"
      description="Explora las sedes y su contexto territorial en Manizales"
    />
    <div class="notice">
      DEMO · Todos los marcadores representan ubicaciones aproximadas ficticias. No son coordenadas
      oficiales de las instituciones.
    </div>
    <div class="filter-bar card">
      <label
        >Institución<select [(ngModel)]="institucion" (ngModelChange)="filterChanged()">
          <option value="">Todas las instituciones</option>
          @for (i of data.instituciones; track i.id) {
            <option [value]="i.id">{{ i.nombre }}</option>
          }
        </select></label
      ><label
        >Sede<select [(ngModel)]="sedeId" (ngModelChange)="renderMarkers()">
          <option value="">Todas las sedes demo</option>
          @for (s of available; track s.id) {
            <option [value]="s.id">{{ s.nombre }}</option>
          }
        </select></label
      ><span class="muted">{{ filtered.length }} sedes de demostración</span>
    </div>
    <div class="map-layout">
      <section class="map-card card">
        <div
          #mapElement
          class="leaflet-map"
          aria-label="Mapa interactivo de sedes ficticias de Manizales"
        ></div>
        <div class="map-legend">
          <span class="legend-dot"></span> Sede educativa ficticia
          <span>Mapa base: OpenStreetMap</span>
        </div>
      </section>
      <div class="map-panel">
        <section class="card layers">
          <h2>Capas del mapa</h2>
          @for (c of data.capas; track c.nombre) {
            <label class="layer"
              ><input
                type="checkbox"
                [checked]="c.disponible && showSedes"
                [disabled]="!c.disponible"
                (change)="toggle()"
              /><span
                ><b>{{ c.nombre }}</b
                ><small>{{ c.descripcion }}</small></span
              ></label
            >
          }
        </section>
        <section class="card sede-list">
          <div class="card-heading">
            <h2>Sedes de demostración</h2>
            <span class="chip">{{ filtered.length }}</span>
          </div>
          @for (s of filtered; track s.id) {
            <button class="sede-row" [class.selected]="selected()?.id === s.id" (click)="select(s)">
              <span class="pin-small">⌖</span
              ><span
                ><b>{{ s.nombre }}</b
                ><small>Ubicación ficticia · DEMO</small></span
              ><span>›</span>
            </button>
          }
        </section>
        @if (selected(); as chosen) {
          <section class="card selection">
            <span class="eyebrow">SEDE SELECCIONADA · DEMO</span>
            <h2>{{ chosen.nombre }}</h2>
            <p>Marcador ficticio asociado al catálogo solo para demostrar la navegación.</p>
            <strong>{{ data.nombre(chosen.institucionId) }}</strong
            ><a [routerLink]="['/instituciones', chosen.institucionId]"
              >Ver ficha institucional →</a
            >
          </section>
        }
      </div>
    </div>`,
})
export class MapaComponent implements AfterViewInit, OnDestroy {
  data = inject(DataService);
  @ViewChild('mapElement') element!: ElementRef<HTMLDivElement>;
  map?: L.Map;
  markers = L.layerGroup();
  selected = signal<SedeEducativa | undefined>(undefined);
  institucion = '';
  sedeId = '';
  showSedes = true;
  get available() {
    return this.data.sedes.filter((s) => !this.institucion || s.institucionId === this.institucion);
  }
  get filtered() {
    return this.available.filter((s) => !this.sedeId || s.id === this.sedeId);
  }
  ngAfterViewInit() {
    this.map = L.map(this.element.nativeElement, { zoomControl: false }).setView(
      [5.064, -75.501],
      13,
    );
    L.control.zoom({ zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(this.map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · colaboradores',
      maxZoom: 19,
    }).addTo(this.map);
    this.markers.addTo(this.map);
    this.renderMarkers();
    setTimeout(() => this.map?.invalidateSize(), 0);
  }
  filterChanged() {
    this.sedeId = '';
    this.renderMarkers();
  }
  toggle() {
    this.showSedes = !this.showSedes;
    this.renderMarkers();
  }
  renderMarkers() {
    this.markers.clearLayers();
    this.selected.set(undefined);
    if (!this.map || !this.showSedes) return;
    this.filtered.forEach((s) => {
      const marker = L.marker([s.lat, s.lng], {
        title: s.nombre + ' · ubicación ficticia DEMO',
        alt: s.nombre + ' · ubicación ficticia DEMO',
        icon: L.divIcon({
          className: 'demo-marker',
          html: '<span></span>',
          iconSize: [28, 36],
          iconAnchor: [14, 36],
        }),
      })
        .bindPopup('<strong>' + s.nombre + '</strong><br>Ubicación ficticia · DEMO')
        .on('click', () => {
          this.selected.set(s);
        });
      marker.addTo(this.markers);
    });
    if (this.filtered.length)
      this.map.fitBounds(L.latLngBounds(this.filtered.map((s) => L.latLng(s.lat, s.lng))), {
        padding: [45, 45],
        maxZoom: 15,
      });
  }
  select(s: SedeEducativa) {
    this.selected.set(s);
    this.map?.setView([s.lat, s.lng], 15);
    this.markers.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.getLatLng().equals([s.lat, s.lng])) layer.openPopup();
    });
  }
  ngOnDestroy() {
    this.map?.remove();
  }
}
