import {db,owner,ownedProject,fail,HttpError,body} from '@/lib/server';

async function connection(request:Request){
 const user=await owner(request),projectId=new URL(request.url).searchParams.get('projectId');
 if(!projectId)throw new HttpError(400,'Select a website.');
 await ownedProject(projectId,user);
 const row=await db().prepare('SELECT * FROM google_project_connections WHERE user_id=? AND project_id=?').bind(user,projectId).first<any>();
 if(!row)throw new HttpError(409,'Connect Google Analytics for this website first.');
 if(row.expires_at<Date.now()+60000){
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID||'',client_secret:process.env.GOOGLE_CLIENT_SECRET||'',refresh_token:row.refresh_token,grant_type:'refresh_token'})});
  const token=await r.json();
  if(!r.ok||!token.access_token)throw new HttpError(409,'Google authorization expired. Reconnect this website.');
  row.access_token=token.access_token;
  await db().prepare('UPDATE google_project_connections SET access_token=?,expires_at=? WHERE user_id=? AND project_id=?').bind(row.access_token,Date.now()+Number(token.expires_in||3600)*1000,user,projectId).run();
 }
 return {row,user,projectId};
}
async function google(url:string,token:string,data?:unknown){
 const r=await fetch(url,{method:data?'POST':'GET',signal:AbortSignal.timeout(20000),headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});
 if(!r.ok)throw new HttpError(r.status===429?429:502,r.status===403?'Google denied access. Check property permissions and enable the Analytics Admin and Data APIs.':r.status===429?'Google request quota reached. Try again later.':'Google Analytics is unavailable. Try again or reconnect.');
 return r.json();
}
async function properties(token:string){
 const result:{id:string,name:string,account:string}[]=[];let page='';
 do{
  const data=await google('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200'+(page?'&pageToken='+encodeURIComponent(page):''),token);
  for(const a of data.accountSummaries||[])for(const p of a.propertySummaries||[])result.push({id:p.property,name:p.displayName,account:a.displayName});
  page=data.nextPageToken||'';
 }while(page);
 return result;
}
export async function GET(request:Request){try{
 const {row}=await connection(request),q=new URL(request.url).searchParams;
 if(q.get('mode')==='properties')return Response.json({properties:await properties(row.access_token),selected:row.property_id},{headers:{'Cache-Control':'no-store'}});
 if(!row.property_id)throw new HttpError(409,'Choose a GA4 property for this website.');
 const days=Number(q.get('days')||28);if(![7,28,90].includes(days))throw new HttpError(400,'Choose 7, 28 or 90 days.');
 const data=await google('https://analyticsdata.googleapis.com/v1beta/'+row.property_id+':runReport',row.access_token,{dateRanges:[{startDate:days+'daysAgo',endDate:'yesterday'}],metrics:[{name:'activeUsers'},{name:'sessions'},{name:'screenPageViews'},{name:'keyEvents'}]});
 return Response.json({property:row.property_id,days,fetchedAt:new Date().toISOString(),metrics:(data.rows?.[0]?.metricValues||[]).map((v:any)=>Number(v.value)),empty:!data.rows?.length},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return fail(e)}}
export async function PATCH(request:Request){try{
 const {row,user,projectId}=await connection(request),input=await body(request);
 const available=await properties(row.access_token);
 if(!available.some(p=>p.id===input.propertyId))throw new HttpError(400,'Choose a property accessible to this Google account.');
 await db().prepare('UPDATE google_project_connections SET property_id=?,updated_at=? WHERE user_id=? AND project_id=?').bind(input.propertyId,new Date().toISOString(),user,projectId).run();
 return Response.json({saved:true});
 }catch(e){return fail(e)}}
