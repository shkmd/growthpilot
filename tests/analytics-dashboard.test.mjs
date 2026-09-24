import test from 'node:test';
import assert from 'node:assert/strict';
import {analyticsPlans,normalizeAnalytics,delta,searchDates,trendRows} from '../lib/analytics-dashboard-data.ts';

test('report periods are adjacent and bounded, with organic search isolated',()=>{
 for(const days of [7,28,90]){
  const p=analyticsPlans(days);
  assert.deepEqual(p.overview.dateRanges,[{startDate:days+'daysAgo',endDate:'yesterday',name:'current'},{startDate:days*2+'daysAgo',endDate:days+1+'daysAgo',name:'previous'}]);
  assert.equal(p.daily.limit,String(days*2));
  assert.equal(p.organic.dimensionFilter.filter.stringFilter.value,'Organic Search');
 }
 assert.throws(()=>analyticsPlans(365));
});
test('normalization preserves zero and unknown metrics without inventing data',()=>{
 const result=normalizeAnalytics({dimensionHeaders:[{name:'dateRange'}],metricHeaders:[{name:'sessions'},{name:'activeUsers'},{name:'keyEvents'}],rows:[{dimensionValues:[{value:'current'}],metricValues:[{value:'0'},{value:'invalid'}]}]});
 assert.deepEqual(result.rows,[{dateRange:'current',sessions:0,activeUsers:null,keyEvents:null}]);
 assert.equal(delta(12,10),20);assert.equal(delta(12,0),null);assert.equal(delta(undefined,10),null);
});
test('Search Console reporting dates use Pacific calendar boundaries',()=>{
 assert.deepEqual(searchDates(7,new Date('2026-09-24T02:00:00Z')),{startDate:'2026-09-16',endDate:'2026-09-22'});
});
test('trend comparison aligns periods using property timezone and preserves gaps',()=>{
 const rows=trendRows([{date:'20260922',sessions:0},{date:'20260915',sessions:9}],7,'sessions',new Date('2026-09-24T02:00:00Z'),'America/Los_Angeles');
 assert.equal(rows.length,7);assert.deepEqual(rows[6],{day:7,date:'20260922',current:0,previous:9});
 assert.equal(rows[0].current,null);
});
