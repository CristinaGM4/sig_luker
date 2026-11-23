import assert from 'node:assert/strict';
import { test } from 'node:test';
import { firstValueFrom, Observable, of, Subject, switchMap } from 'rxjs';
import { collectPages, publicFeaturesPath, isPrivateApi, apiErrorMessage, publicApiErrorMessage } from '../src/app/core/api/pagination.ts';

test('recorre páginas y mantiene una consulta espacial fija', async () => {
  const bbox = '-75.6,5,-75.4,5.2';
  const calls = [];
  const result = await firstValueFrom(collectPages(cursor => {
    calls.push({ bbox, cursor });
    return of(cursor === undefined ? { items: [1,2], nextCursor: 2 } : { items: [3], nextCursor: null });
  }));
  assert.deepEqual(result, [1,2,3]);
  assert.deepEqual(calls, [{bbox,cursor:undefined},{bbox,cursor:2}]);
});
test('catálogo vacío produce estado sin resultados y detiene paginación', async () => {
  assert.deepEqual(await firstValueFrom(collectPages(() => of({items:[],nextCursor:null}))), []);
});
test('rechaza cursor repetido y no devuelve páginas parciales como resultado completo', async () => {
  await assert.rejects(firstValueFrom(collectPages(() => of({items:[1],nextCursor:1}))), /cursor/);
});
test('mover la vista cancela la página anterior y reinicia el cursor', () => {
  const viewport = new Subject();
  const requests = [];
  const cancelled = [];
  const subscription = viewport.pipe(switchMap(bbox => collectPages(cursor => new Observable(() => {
    requests.push({bbox,cursor});
    return () => cancelled.push(bbox);
  })))).subscribe();
  viewport.next('area-1');
  viewport.next('area-2');
  assert.deepEqual(cancelled,['area-1']);
  assert.deepEqual(requests,[{bbox:'area-1',cursor:undefined},{bbox:'area-2',cursor:undefined}]);
  subscription.unsubscribe();
  assert.deepEqual(cancelled,['area-1','area-2']);
});
test('Bearer queda limitado a rutas internas y de sesión del mismo origen', () => {
  assert.equal(isPrivateApi('/api/v1/interno/instituciones/id/sig/puntos'),true);
  assert.equal(isPrivateApi('/api/v1/auth/me'),true);
  for (const url of ['/api/v1/publico/sig/capas','https://otro.test/api/v1/auth/me','/api/v1/auth-externa']) assert.equal(isPrivateApi(url),false);
});
test('rechaza featuresPath externos o fuera del contrato SIG', () => {
  assert.equal(publicFeaturesPath('/api/v1/publico/sig/microzonificacion'),'/api/v1/publico/sig/microzonificacion');
  for (const url of ['https://otro.test/geo','/api/v1/interno/geo','//otro.test/geo']) assert.throws(()=>publicFeaturesPath(url));
});
test('403 y 404 presentan el mismo mensaje sin revelar el recurso', () => {
  assert.equal(apiErrorMessage(403),apiErrorMessage(404));
  assert.match(apiErrorMessage(401),/sesión/i);
  assert.match(apiErrorMessage(422),/intervalo/i);
  assert.match(apiErrorMessage(429),/más tarde/i);
});

test('las consultas públicas no solicitan sesión ante errores de disponibilidad', () => {
  for (const status of [401,403,404]) {
    assert.doesNotMatch(publicApiErrorMessage(status), /sesión|token|ingresa/i);
    assert.match(publicApiErrorMessage(status), /servicio de capas públicas/i);
  }
});
