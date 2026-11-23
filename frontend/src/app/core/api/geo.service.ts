import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import type { MultiPolygon, Point } from 'geojson';
import {
  GeoLayer,
  GeoPage,
  Institution,
  MicroProperties,
  Page,
  PointProperties,
  PublicSiteProperties,
} from './contracts';
import { collectPages, publicFeaturesPath } from './pagination';
@Injectable({ providedIn: 'root' })
export class GeoService {
  private http = inject(HttpClient);
  layers() {
    return this.http
      .get<{ layers: GeoLayer[] }>('/api/v1/publico/sig/capas')
      .pipe(map((r) => r.layers));
  }
  publicSites() {
    return this.http
      .get<{
        type: 'FeatureCollection';
        features: import('geojson').Feature<Point, PublicSiteProperties>[];
      }>('/api/v1/publico/sig/instituciones')
      .pipe(map((response) => response.features));
  }
  institutions() {
    return collectPages<Institution, string>((after) =>
      this.http.get<Page<Institution>>('/api/v1/interno/catalogos/instituciones', {
        params: { limit: 100, ...(after ? { after } : {}) },
      }),
    );
  }
  microzonification(layer: GeoLayer, bbox: string) {
    const path = publicFeaturesPath(layer.featuresPath);
    return collectPages<GeoPage<MultiPolygon, MicroProperties>['features'][number], number>(
      (after) =>
        this.http
          .get<GeoPage<MultiPolygon, MicroProperties>>(path, {
            params: { bbox, ...(after !== undefined ? { after } : {}) },
          })
          .pipe(map((p) => ({ items: p.features, nextCursor: p.nextCursor as number | null }))),
    );
  }
  points(institutionId: string, bbox: string) {
    return collectPages<GeoPage<Point, PointProperties>['features'][number], string>((after) =>
      this.http
        .get<GeoPage<Point, PointProperties>>(
          `/api/v1/interno/instituciones/${encodeURIComponent(institutionId)}/sig/puntos`,
          { params: { bbox, ...(after ? { after } : {}) } },
        )
        .pipe(map((p) => ({ items: p.features, nextCursor: p.nextCursor as string | null }))),
    );
  }
}
