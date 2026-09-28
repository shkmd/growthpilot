import test from 'node:test';
import assert from 'node:assert/strict';
import {seoOpportunities} from '../lib/seo-opportunities.ts';
const report=rows=>({startDate:'2026-08-01',endDate:'2026-08-28',reports:{pages:{status:'available',rows}}});
const row=(url,position=5,ctr=.01,impressions=100)=>({keys:[url],position,ctr,impressions,clicks:1});
test('opportunities require measured qualifying data and deduplicate URLs',()=>{
 const result=seoOpportunities(null,report([row('/a'),row('/a'),row('/b',15),row('/c',25),row('/d',5,.01,99),{keys:['/e'],impressions:100}]));
 assert.equal(result.length,2);assert.equal(result[0].priority,'High');assert.equal(result[1].priority,'Medium');
 assert.match(result[0].evidence,/2026-08-01/);
});
test('unavailable search does not remove critical crawl findings',()=>{
 const result=seoOpportunities({issues:[{title:'Broken link',severity:'Critical',why:'404',fix:'Repair link',urls:['/a']}]},{reports:{pages:{status:'unavailable'}}});
 assert.equal(result.length,1);assert.equal(result[0].action,'Repair link');assert.equal(result[0].priority,'Critical');
});
test('healthy, zero and missing search data do not create invented opportunities',()=>{
 assert.deepEqual(seoOpportunities(null,report([row('/a',5,.03),row('/b',0),row('/c',5,.01,0)])),[]);
 assert.deepEqual(seoOpportunities(null,null),[]);
});
