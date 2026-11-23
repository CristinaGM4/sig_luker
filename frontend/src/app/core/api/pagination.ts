import { Observable, defer, of, switchMap, map } from 'rxjs';
// Each subscription owns its cursor history. Unsubscribing cancels the active HTTP page.
export function collectPages<T, C extends string | number>(
  fetchPage: (cursor?: C) => Observable<{ items: T[]; nextCursor: C | null }>,
): Observable<T[]> {
  return defer(() => {
    const seen = new Set<C>();
    const visit = (cursor?: C): Observable<T[]> =>
      fetchPage(cursor).pipe(
        switchMap((page) => {
          if (page.nextCursor === null) return of(page.items);
          if (seen.has(page.nextCursor)) throw new Error('La API repitió un cursor de paginación.');
          seen.add(page.nextCursor);
          return visit(page.nextCursor).pipe(map((rest) => [...page.items, ...rest]));
        }),
      );
    return visit();
  });
}
export function publicFeaturesPath(path: string): string {
  if (path !== '/api/v1/publico/sig/microzonificacion')
    throw new Error('Ruta de capa no admitida por esta integración.');
  return path;
}
export function apiErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Revisa los filtros de la consulta.';
    case 401:
      return 'La sesión venció o es inválida. Ingresa un token vigente.';
    case 403:
    case 404:
      return 'Recurso no disponible para esta sesión o instancia.';
    case 409:
      return 'Ya existe un registro para esta operación.';
    case 422:
      return 'Reduce el intervalo o ajusta los filtros.';
    case 429:
      return 'Se alcanzó el límite de solicitudes. Inténtalo más tarde.';
    default:
      return 'No se pudo conectar con la API. Comprueba que el backend esté iniciado.';
  }
}
export function isPrivateApi(url: string): boolean {
  return /^\/api\/v1\/(?:interno(?:\/|$)|auth(?:\/|$))/.test(url);
}

export function publicApiErrorMessage(status: number): string {
  if ([401, 403, 404].includes(status))
    return 'El servicio de capas públicas no está disponible en esta instancia del backend.';
  return apiErrorMessage(status);
}
