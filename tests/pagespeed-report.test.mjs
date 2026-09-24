import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePageSpeed} from '../lib/pagespeed-report.ts';
test('preserves zero metrics, null scores, manual checks and category membership',()=>{
 const result=normalizePageSpeed({lighthouseResult:{audits:{cls:{id:'cls',score:1,numericValue:0},'cumulative-layout-shift':{numericValue:0},manual:{id:'manual',score:null,scoreDisplayMode:'manual'}},categories:{performance:{title:'Performance',score:0,auditRefs:[{id:'cls'}]},accessibility:{title:'Accessibility',score:null,auditRefs:[{id:'manual'}]}},fetchTime:'2026-09-23T00:00:00Z'}},'mobile');
 assert.equal(result.score,0);assert.equal(result.cls,0);assert.equal(result.categories[1].score,null);assert.equal(result.categories[1].audits[0].mode,'manual');assert.equal(result.field,null);assert.equal(result.tbt,null);
});
test('runtime errors do not become successful scores',()=>{assert.equal(normalizePageSpeed({lighthouseResult:{audits:{},runtimeError:{message:'Failed'}}},'desktop').status,'unavailable')});
test('does not silently substitute origin field data for URL data',()=>{const r=normalizePageSpeed({lighthouseResult:{audits:{},categories:{}},originLoadingExperience:{metrics:{}}},'desktop');assert.equal(r.field,null)});
test('accepts bounded raster screenshots and rejects unsafe image payloads',()=>{
 const payload=data=>({lighthouseResult:{audits:{'final-screenshot':{details:{data}}},categories:{}}});
 assert.equal(normalizePageSpeed(payload('data:image/jpeg;base64,YQ=='),'mobile').screenshot,'data:image/jpeg;base64,YQ==');
 assert.equal(normalizePageSpeed(payload('data:image/svg+xml;base64,YQ=='),'mobile').screenshot,null);
 assert.equal(normalizePageSpeed(payload('data:image/png;base64,'+'a'.repeat(600000)),'desktop').screenshot,null);
});
