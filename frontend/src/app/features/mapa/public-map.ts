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
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import type { Feature, FeatureCollection, MultiPolygon, Point } from 'geojson';
import { GeoService } from '../../core/api/geo.service';
import { PUBLIC_INSTITUTIONS } from '../../core/api/public-institutions';
import { GeoLayer, MicroProperties, PublicSiteProperties } from '../../core/api/contracts';
import { publicApiErrorMessage } from '../../core/api/pagination';
const COLORS: Record<string, string> = { A: '#d5ad38', B: '#db8066', P: '#609f99', T: '#8691bd' };
@Component({
  imports: [FormsModule, RouterLink],
  template: `<div class="integration-heading">
      <div>
        <span class="eyebrow">SIG ESCOLAR / MANIZALES</span>
        <h1>Visor geográfico</h1>
        <p>Consulta pública de cartografía y contexto institucional</p>
      </div>
      <span class="integration-badge">Conexión al backend</span>
    </div>
    <div class="notice integration-notice">
      <strong>Microzonificación histórica de 2002</strong>
      <p>
        Consulta la fuente y la leyenda de cada capa. La cartografía se presenta sin asignar niveles
        de riesgo a instituciones.
      </p>
    </div>
    <div class="filter-bar card">
      <label
        >Institución educativa<select
          [ngModel]="institution()"
          (ngModelChange)="changeInstitution($event)"
        >
          <option value="">Todas las instituciones del piloto</option>
          @for (i of institutions; track i.id) {
            <option [value]="i.id">{{ i.name }}</option>
          }
        </select></label
      ><button type="button" class="button secondary" (click)="reloadLayers()">
        Actualizar catálogo de capas</button
      ><button type="button" class="text-button" (click)="resetView()">Centrar en Manizales</button>
    </div>
    <div class="map-layout integration-map">
      <section class="map-card card">
        <div #mapElement class="leaflet-map" aria-label="Mapa interactivo de Manizales"></div>
        <div class="map-feedback" aria-live="polite">{{ zoneState() }}</div>
        <div class="map-legend">Coordenadas WGS84 · consulta por área visible</div>
      </section>
      <div class="map-panel">
        <section class="card c2-panel">
          <h2>Capas del mapa</h2>
          @if (layersLoading()) {
            <p role="status">Consultando catálogo…</p>
          } @else if (layerError()) {
            <p class="error" role="alert">{{ layerError() }}</p>
            <button class="button secondary" (click)="reloadLayers()">Reintentar</button>
          } @else if (!layers().length) {
            <div class="empty compact">
              <h3>Sin capas cargadas</h3>
              <p>
                El backend respondió con un catálogo vacío. Se mostrará la cartografía cuando se
                importe una capa.
              </p>
            </div>
          } @else {
            <label class="layer"
              ><input type="checkbox" [(ngModel)]="showZones" (change)="loadZones()" /><span
                ><b>Microzonificación sísmica</b
                ><small>Selecciona una capa del catálogo</small></span
              ></label
            ><label
              >Capa pública<select [(ngModel)]="layerId" (ngModelChange)="loadZones()">
                @for (l of layers(); track l.id) {
                  <option [value]="l.id">{{ l.title }} · {{ l.year }}</option>
                }
              </select></label
            >
          }
          <label class="layer pending-layer"
            ><input type="checkbox" disabled /><span
              ><b>Hallazgos de campo</b><small>Pendiente de API</small></span
            ></label
          ><label class="layer"
            ><input type="checkbox" [(ngModel)]="showSites" (change)="renderSites()" /><span
              ><b>Sedes educativas</b
              ><small>{{ sites().length }} puntos del archivo instituciones.gpkg</small></span
            ></label
          >
        </section>
        @if (activeLayer; as layer) {
          <section class="card c2-panel">
            <h2>Leyenda y fuente</h2>
            <p>{{ layer.title }}</p>
            <div class="layer-metadata">
              <span
                >{{ layer.year }} ·
                {{ layer.historical ? 'Histórica' : 'Consultar metadatos' }}</span
              ><span>{{ layer.crs }} · {{ layer.geometryType }}</span
              ><span>Fuente {{ layer.source }}</span>
            </div>
            @for (item of legend; track item.code) {
              <div class="legend-item">
                <i [style.background]="color(item.code)"></i>
                <div>
                  <strong>{{ item.code }}</strong
                  ><span>{{ item.label }}</span>
                </div>
              </div>
            }
          </section>
        }
        <section class="card c2-panel">
          <h2>Instituciones del piloto</h2>
          <p>Sedes recibidas del backend · asociación de consulta por nombre.</p>
          @if (selectedInstitution; as item) {
            <div class="scope-note">
              <h3>{{ item.name }}</h3>
              <p>{{ visibleSites.length }} sedes disponibles en la capa aportada.</p>
              <a
                class="button secondary"
                routerLink="/componente-2"
                [queryParams]="{ institucion: item.id }"
                >Abrir Componente 2</a
              >
            </div>
          } @else {
            <p>Selecciona una institución para abrir su consulta en el Componente 2.</p>
          }
          @if (siteError()) {
            <p class="error" role="alert">{{ siteError() }}</p>
            <button class="button secondary" (click)="reloadSites()">Reintentar sedes</button>
          }
          @if (sitesLoading()) {
            <p role="status">Cargando sedes…</p>
          }
          <div class="public-site-list">
            @for (site of visibleSites; track site.id) {
              <button
                class="sede-row"
                [class.selected]="selectedSite()?.id === site.id"
                (click)="selectSite(site)"
              >
                <span
                  ><b>{{ site.properties.label }}</b
                  ><small>{{
                    site.properties.principal ? 'Principal según archivo' : 'Sede según archivo'
                  }}</small></span
                >
              </button>
            }
          </div>
          @if (selectedSite(); as site) {
            <div class="scope-note">
              <h3>{{ site.properties.label }}</h3>
              <p>Código DANE {{ site.properties.dane }}</p>
              <p>Fuente {{ site.properties.source }}</p>
              @if (site.properties.mappingNote) {
                <p>{{ site.properties.mappingNote }}</p>
              }
              <a
                class="button"
                routerLink="/componente-2"
                [queryParams]="{ institucion: site.properties.institutionKey, sede: site.id }"
                >Ver institución en Componente 2</a
              >
            </div>
          }
        </section>
      </div>
    </div>`,
})
export class PublicMapComponent implements AfterViewInit, OnDestroy {
  api = inject(GeoService);
  @ViewChild('mapElement') element!: ElementRef<HTMLDivElement>;
  private map?: L.Map;
  private zones = L.geoJSON();
  private siteLayer = L.layerGroup();
  private siteRequest?: Subscription;
  sites = signal<Feature<Point, PublicSiteProperties>[]>([]);
  selectedSite = signal<Feature<Point, PublicSiteProperties> | null>(null);
  sitesLoading = signal(false);
  siteError = signal('');
  showSites = true;
  private layerRequest?: Subscription;
  private zoneRequest?: Subscription;
  layers = signal<GeoLayer[]>([]);
  layersLoading = signal(false);
  layerError = signal('');
  zoneState = signal('Esperando catálogo de capas.');
  readonly institutions = PUBLIC_INSTITUTIONS;
  institution = signal('');
  layerId = '';
  showZones = true;
  get selectedInstitution() {
    return this.institutions.find((item) => item.id === this.institution());
  }
  get activeLayer() {
    return this.layers().find((l) => l.id === this.layerId);
  }
  get legend() {
    return Object.entries(this.activeLayer?.legend ?? {}).map(([code, label]) => ({ code, label }));
  }
  color(code: string) {
    return COLORS[code] ?? '#768d9b';
  }
  ngAfterViewInit() {
    this.map = L.map(this.element.nativeElement, {
      zoomControl: false,
      minZoom: 3,
      maxBounds: [
        [-85, -180],
        [85, 180],
      ],
    }).setView([5.064, -75.501], 13);
    L.control.zoom({ zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(this.map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · colaboradores',
      maxZoom: 19,
      noWrap: true,
    }).addTo(this.map);
    this.zones.addTo(this.map);
    this.siteLayer.addTo(this.map);
    this.reloadSites();
    this.map.on('moveend', () => {
      this.loadZones();
    });
    this.reloadLayers();
  }
  private bbox() {
    if (!this.map) return '';
    const b = this.map.getBounds();
    return [
      Math.max(-180, b.getWest()),
      Math.max(-90, b.getSouth()),
      Math.min(180, b.getEast()),
      Math.min(90, b.getNorth()),
    ]
      .map((n) => n.toFixed(7))
      .join(',');
  }
  reloadLayers() {
    this.layerRequest?.unsubscribe();
    this.zoneRequest?.unsubscribe();
    this.zones.clearLayers();
    this.layers.set([]);
    this.layerId = '';
    this.layerError.set('');
    this.layersLoading.set(true);
    this.zoneState.set('Consultando catálogo de capas…');
    this.layerRequest = this.api.layers().subscribe({
      next: (layers) => {
        this.layers.set(layers);
        this.layerId = layers[0]?.id ?? '';
        this.layersLoading.set(false);
        this.loadZones();
      },
      error: (e) => {
        this.layersLoading.set(false);
        this.layerError.set(publicApiErrorMessage(e.status));
        this.zoneState.set('Catálogo no disponible. Comprueba la conexión con el backend.');
      },
    });
  }
  loadZones() {
    this.zoneRequest?.unsubscribe();
    this.zones.clearLayers();
    const layer = this.activeLayer;
    const bbox = this.bbox();
    if (!layer) {
      this.zoneState.set(
        this.layerError() ? 'Catálogo no disponible.' : 'No hay una capa cargada para consultar.',
      );
      return;
    }
    if (!this.showZones) {
      this.zoneState.set('Capa de microzonificación oculta.');
      return;
    }
    if (!bbox) return;
    this.zoneState.set('Consultando entidades en el área visible…');
    try {
      this.zoneRequest = this.api.microzonification(layer, bbox).subscribe({
        next: (features) => {
          const collection: FeatureCollection<MultiPolygon, MicroProperties> = {
            type: 'FeatureCollection',
            features,
          };
          this.zones.addData(collection);
          this.zones.eachLayer((l) => {
            const geo = l as L.Path & { feature: Feature<MultiPolygon, MicroProperties> };
            geo.setStyle({
              color: this.color(geo.feature.properties.zone),
              fillColor: this.color(geo.feature.properties.zone),
              fillOpacity: 0.3,
              weight: 1.5,
            });
            const content = document.createElement('div');
            content.textContent = `${geo.feature.properties.zone} · ${geo.feature.properties.label} · ${geo.feature.properties.mapYear}`;
            geo.bindPopup(content);
          });
          this.zoneState.set(
            features.length
              ? `${features.length} entidades consultadas en el área visible.`
              : 'Capa cargada, sin entidades en esta área. Mueve el mapa para consultar otra zona.',
          );
        },
        error: (e) => this.zoneState.set(publicApiErrorMessage(e.status)),
      });
    } catch {
      this.zoneState.set('El catálogo contiene una ruta de capa no admitida por esta integración.');
    }
  }
  changeInstitution(id: string) {
    this.institution.set(id);
    this.selectedSite.set(null);
    this.renderSites();
    this.fitSites();
  }
  get visibleSites() {
    return this.sites().filter(
      (site) => !this.institution() || site.properties.institutionKey === this.institution(),
    );
  }
  reloadSites() {
    this.siteRequest?.unsubscribe();
    this.siteLayer.clearLayers();
    this.sites.set([]);
    this.selectedSite.set(null);
    this.siteError.set('');
    this.sitesLoading.set(true);
    this.siteRequest = this.api.publicSites().subscribe({
      next: (sites) => {
        this.sites.set(sites);
        this.sitesLoading.set(false);
        this.renderSites();
        this.fitSites();
      },
      error: () => {
        this.sitesLoading.set(false);
        this.siteError.set('No se pudo consultar la capa pública de sedes. Comprueba el backend.');
      },
    });
  }
  renderSites() {
    this.siteLayer.clearLayers();
    if (!this.showSites) return;
    for (const site of this.visibleSites) {
      const [lon, lat] = site.geometry.coordinates;
      const content = document.createElement('div');
      content.textContent = site.properties.label;
      L.circleMarker([lat, lon], {
        radius: this.selectedSite()?.id === site.id ? 10 : 7,
        color: '#ffffff',
        weight: 2,
        fillColor: '#0b7f89',
        fillOpacity: 1,
      })
        .bindTooltip(site.properties.label)
        .bindPopup(content)
        .on('click', () => this.selectSite(site, false))
        .addTo(this.siteLayer);
    }
  }
  selectSite(site: Feature<Point, PublicSiteProperties>, focus = true) {
    this.institution.set(site.properties.institutionKey);
    this.selectedSite.set(site);
    this.renderSites();
    const [lon, lat] = site.geometry.coordinates;
    if (focus) this.map?.setView([lat, lon], 15);
    this.siteLayer.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker && layer.getLatLng().equals([lat, lon]))
        layer.openPopup();
    });
  }
  private fitSites() {
    if (this.visibleSites.length)
      this.map?.fitBounds(
        L.latLngBounds(
          this.visibleSites.map((s) =>
            L.latLng(s.geometry.coordinates[1], s.geometry.coordinates[0]),
          ),
        ),
        { padding: [35, 35], maxZoom: 15 },
      );
  }
  resetView() {
    this.institution.set('');
    this.selectedSite.set(null);
    this.renderSites();
    if (this.sites().length) this.fitSites();
    else this.map?.setView([5.064, -75.501], 13);
  }
  ngOnDestroy() {
    this.layerRequest?.unsubscribe();
    this.zoneRequest?.unsubscribe();
    this.siteRequest?.unsubscribe();
    this.map?.remove();
  }
}
