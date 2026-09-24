export const summaryMetrics=['activeUsers','totalUsers','newUsers','sessions','screenPageViews','keyEvents','engagementRate','averageSessionDuration','screenPageViewsPerSession'];
export function analyticsPlans(days:number){
 if(![7,28,90].includes(days))throw Error('Choose 7, 28 or 90 days.');
 const current={startDate:days+'daysAgo',endDate:'yesterday',name:'current'},previous={startDate:(days*2)+'daysAgo',endDate:(days+1)+'daysAgo',name:'previous'};
 const plan=(dimensions:string[],metrics:string[],limit=10,sort?:string)=>({dateRanges:[current],dimensions:dimensions.map(name=>({name})),metrics:metrics.map(name=>({name})),limit:String(limit),...(sort?{orderBys:[{metric:{metricName:sort},desc:true}]}:{})});
 return {
  overview:{...plan([],summaryMetrics),dateRanges:[current,previous]},
  daily:{...plan(['date'],['activeUsers','sessions','screenPageViews'],days*2),dateRanges:[{startDate:(days*2)+'daysAgo',endDate:'yesterday'}],orderBys:[{dimension:{dimensionName:'date'}}]},
  channels:plan(['sessionDefaultChannelGroup'],['sessions','activeUsers','engagedSessions','engagementRate'],15,'sessions'),
  cities:plan(['city','country'],['activeUsers','sessions'],10,'activeUsers'),
  visitors:plan(['newVsReturning'],['activeUsers','sessions','screenPageViews','screenPageViewsPerSession','averageSessionDuration'],10,'activeUsers'),
  pages:plan(['pageTitle','pagePath'],['screenPageViews','sessions','engagementRate','averageSessionDuration'],20,'screenPageViews'),
  devices:plan(['deviceCategory'],['activeUsers','sessions'],10,'activeUsers'),
  organic:{...plan([],['activeUsers','sessions','keyEvents']),dimensionFilter:{filter:{fieldName:'sessionDefaultChannelGroup',stringFilter:{matchType:'EXACT',value:'Organic Search'}}}},
  revenue:plan([],['totalRevenue','totalAdRevenue','publisherAdImpressions','publisherAdClicks'])
 };
}
export function normalizeAnalytics(data:any){return {rows:(data.rows||[]).map((row:any)=>{
 const out:Record<string,string|number|null>={};(data.dimensionHeaders||[]).forEach((h:any,i:number)=>{out[h.name]=row.dimensionValues?.[i]?.value??''});(data.metricHeaders||[]).forEach((h:any,i:number)=>{const raw=row.metricValues?.[i]?.value;out[h.name]=raw!==undefined&&Number.isFinite(Number(raw))?Number(raw):null});return out;
 }),rowCount:data.rowCount??0,metadata:data.metadata||{}}}
export function delta(current:unknown,previous:unknown){return typeof current==='number'&&typeof previous==='number'&&previous!==0?((current-previous)/previous)*100:null}
export function searchDates(days:number,now=new Date()){
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const offset=(n:number)=>{const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-n);return d.toISOString().slice(0,10)};
 return {startDate:offset(days),endDate:offset(1)};
}
export function trendRows(rows:any[],days:number,metric:string,now=new Date(),timeZone='UTC'){
 let today:string;try{today=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}catch{today=now.toISOString().slice(0,10)}
 const key=(offset:number)=>{const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-offset);return d.toISOString().slice(0,10).replaceAll('-','')};
 const values=new Map(rows.map(r=>[r.date,r[metric]]));return Array.from({length:days},(_,i)=>({day:i+1,date:key(days-i),current:values.get(key(days-i))??null,previous:values.get(key(days*2-i))??null}));
}
