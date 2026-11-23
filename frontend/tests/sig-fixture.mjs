// Isolated synthetic contract fixture. Never used by npm start or production.
import { createServer } from 'node:http';
let scenario='loaded';
const institutionId='00000000-0000-4000-8000-000000000001';
const layer={id:'test-layer',title:'Capa sintética de prueba',year:2002,historical:true,crs:'EPSG:4326',geometryType:'MultiPolygon',source:'Fixture sintético de QA',featuresPath:'/api/v1/publico/sig/microzonificacion',legend:{P:'Zona sintética para pruebas'}};
createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const respond=(body,status=200)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
 if(url.pathname==='/__scenario'&&req.method==='POST'){scenario=url.searchParams.get('value')??'loaded';return respond({scenario});}
 if(url.pathname.startsWith('/api/v1/interno')||url.pathname.startsWith('/api/v1/auth')){
  if(req.headers.authorization!=='Bearer synthetic-qa-token')return respond({message:'Unauthorized'},401);
  if(scenario==='forbidden')return respond({message:'Forbidden'},403);
 }
 if(url.pathname==='/api/v1/auth/me')return respond({accountId:institutionId,roles:['qa'],permissions:['records:read']});
 if(url.pathname==='/api/v1/auth/session'){res.writeHead(204);return res.end();}
 if(url.pathname==='/api/v1/publico/sig/capas')return respond({layers:scenario==='empty'?[]:[layer]});
 if(url.pathname==='/api/v1/publico/sig/microzonificacion'){
  if(scenario==='no-features')return respond({type:'FeatureCollection',features:[],nextCursor:null});
  const id=url.searchParams.has('after')?2:1;
  return respond({type:'FeatureCollection',features:[{type:'Feature',id,properties:{zone:'P',label:'Polígono sintético QA '+id,mapYear:2002},geometry:{type:'MultiPolygon',coordinates:[[[[-75.52,5.05],[-75.49,5.05],[-75.49,5.075],[-75.52,5.075],[-75.52,5.05]]]]}}],nextCursor:id===1?1:null});
 }
 if(url.pathname==='/api/v1/interno/catalogos/instituciones')return respond({items:[{id:institutionId,code:'QA',name:'Institución sintética QA',active:true}],nextCursor:null});
 if(url.pathname===`/api/v1/interno/instituciones/${institutionId}/sig/puntos`)return respond({type:'FeatureCollection',features:[{type:'Feature',id:'qa-point',geometry:{type:'Point',coordinates:[-75.501,5.064]},properties:{label:'Punto sintético QA',source:'Fixture sintético'}}],nextCursor:null});
 return respond({message:'Not found'},404);
}).listen(3001,'127.0.0.1',()=>console.log('Fixture sintético QA en 127.0.0.1:3001'));
