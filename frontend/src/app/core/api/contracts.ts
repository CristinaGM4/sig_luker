import type { Feature, MultiPolygon, Point } from 'geojson';
export interface GeoLayer {
  id: string;
  title: string;
  year: number;
  historical: boolean;
  crs: string;
  geometryType: string;
  source: string;
  featuresPath: string;
  legend: Record<string, string>;
}
export interface MicroProperties {
  zone: string;
  label: string;
  mapYear: number;
}
export interface PointProperties {
  label: string;
  source: string;
}
export interface GeoPage<G extends MultiPolygon | Point, P> {
  type: 'FeatureCollection';
  features: Feature<G, P>[];
  nextCursor: string | number | null;
}
export interface Institution {
  id: string;
  code: string;
  name: string;
  active: boolean;
}
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}
export interface SessionIdentity {
  accountId: string;
  roles: string[];
  permissions: string[];
}

export interface PublicSiteProperties {
  institutionKey: string;
  label: string;
  dane: string;
  parentDane: string;
  principal: boolean;
  source: string;
  mappingBasis: 'reference-name';
  mappingNote: string | null;
}
