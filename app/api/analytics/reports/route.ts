import {db,fail,HttpError,body} from '@/lib/server';
import {connection,google,properties} from '@/lib/google-analytics-server';
import {analyticsPlans,normalizeAnalytics} from '@/lib/analytics-dashboard-data';
export async function GET(request:Request){try{
 const {row}=await connection(request),q=new URL(request.url).searchParams;
 if(q.get('mode')==='properties')return Response.json({properties:await properties(row.access_token),selected:row.property_id},{headers:{'Cache-Control':'no-store'}});
 if(!row.property_id)throw new HttpError(409,'Choose a GA4 property for this website.');
 const days=Number(q.get('days')||28);if(![7,28,90].includes(days))throw new HttpError(400,'Choose 7, 28 or 90 days.');
 if(q.get('mode')==='dashboard'){
  const plans=Object.entries(analyticsPlans(days)),reports:Record<string,unknown>={};
  // Bound concurrent GA requests so one failed panel does not discard other reports.
  for(let i=0;i<plans.length;i+=3){const group=plans.slice(i,i+3);const results=await Promise.allSettled(group.map(([,plan])=>google('https://analyticsdata.googleapis.com/v1beta/'+row.property_id+':runReport',row.access_token,plan)));results.forEach((r,j)=>{reports[group[j][0]]=r.status==='fulfilled'?{...normalizeAnalytics(r.value),status:'available'}:{status:'unavailable',error:r.reason instanceof Error?r.reason.message:'Google did not return this report.'}})}
  return Response.json({property:row.property_id,days,fetchedAt:new Date().toISOString(),reports},{headers:{'Cache-Control':'private, no-store'}});
 } const data=await google('https://analyticsdata.googleapis.com/v1beta/'+row.property_id+':runReport',row.access_token,{dateRanges:[{startDate:days+'daysAgo',endDate:'yesterday'}],metrics:[{name:'activeUsers'},{name:'sessions'},{name:'screenPageViews'},{name:'keyEvents'}]});
 return Response.json({property:row.property_id,days,fetchedAt:new Date().toISOString(),metrics:(data.rows?.[0]?.metricValues||[]).map((v:any)=>Number(v.value)),empty:!data.rows?.length},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return fail(e)}}
export async function PATCH(request:Request){try{
 const {row,user,projectId}=await connection(request),input=await body(request);
 const available=await properties(row.access_token);
 if(!available.some(p=>p.id===input.propertyId))throw new HttpError(400,'Choose a property accessible to this Google account.');
 await db().prepare('UPDATE google_project_connections SET property_id=?,updated_at=? WHERE user_id=? AND project_id=?').bind(input.propertyId,new Date().toISOString(),user,projectId).run();
 return Response.json({saved:true});
 }catch(e){return fail(e)}}

