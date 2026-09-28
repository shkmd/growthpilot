import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync(new URL('../app/api/content-draft/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function harness({allowed=true,record=true,limit=true,status='completed',draft='A reviewable draft'}={}){
 let calls=0,queryValues,providerBody;
 class HttpError extends Error{constructor(status,message){super(message);this.status=status}}
 const server={HttpError,owner:async()=> 'alice',body:r=>r.json(),textValue:v=>v,
 ownedProject:async()=>{if(!allowed)throw new HttpError(404,'Project not found');return {id:'project-a',name:'Example',language:'English'}},
 fail:e=>Response.json({error:e.message},{status:e.status||500}),
 db:()=>({prepare:sql=>({bind(...values){if(sql.includes('WHERE id='))queryValues=values;return this},async first(){return sql.includes("kind='content'")&&record?{data:JSON.stringify({title:'Brief',body:'Approved source facts'})}:null},async run(){return {meta:{changes:limit?1:0}}}})})};
 const exports={};
 new Function('require','exports','fetch','process',source)(()=>server,exports,async(_url,init)=>{calls++;providerBody=JSON.parse(init.body);return Response.json({status,output:[{type:'message',content:[{type:'output_text',text:draft}]}]})},{env:{OPENAI_API_KEY:'test-only',OPENAI_MODEL:'test-model'}});
 return {post:()=>exports.POST(new Request('https://example.test/api/content-draft',{method:'POST',body:JSON.stringify({projectId:'project-a',recordId:'brief-a'})})),get calls(){return calls},get queryValues(){return queryValues},get providerBody(){return providerBody}};
}
test('unauthorized project and missing brief never call the provider',async()=>{
 for(const setup of [{allowed:false},{record:false}]){const h=harness(setup);assert.equal((await h.post()).status,404);assert.equal(h.calls,0)}
});
test('quota prevents provider charges',async()=>{
 const h=harness({limit:false});assert.equal((await h.post()).status,429);assert.equal(h.calls,0);
});
test('draft uses owner-scoped source, disables response storage and returns no automatic saved record',async()=>{
 const h=harness(),r=await h.post();assert.equal(r.status,200);assert.deepEqual(h.queryValues,['brief-a','project-a','alice']);assert.equal(h.providerBody.store,false);assert.match(h.providerBody.input,/Approved source facts/);assert.equal((await r.json()).draft,'A reviewable draft');
});
test('incomplete and oversized outputs cannot become saved drafts',async()=>{
 for(const setup of [{status:'incomplete'},{draft:'x'.repeat(8001)},{draft:''}]){const h=harness(setup);assert.equal((await h.post()).status,502)}
});
