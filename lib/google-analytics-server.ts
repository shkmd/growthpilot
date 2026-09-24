import {db,owner,ownedProject,fail,HttpError,body} from '@/lib/server';

export async function connection(request:Request){
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
export async function google(url:string,token:string,data?:unknown){
 const r=await fetch(url,{method:data?'POST':'GET',signal:AbortSignal.timeout(20000),headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});
 if(!r.ok){
  const service=url.includes('/webmasters/')?'Search Console API':url.includes('analyticsadmin')?'Analytics Admin API':'Analytics Data API';
  const payload=await r.json().catch(()=>({}));const reason=payload.error?.details?.find((d:any)=>d.reason)?.reason;
  const message=r.status===429?'Google request quota reached. Try again later.':reason==='SERVICE_DISABLED'?`Enable ${service} in the Cloud project used by GrowthPilot’s OAuth client.`:reason==='ACCESS_TOKEN_SCOPE_INSUFFICIENT'?`Reconnect Google and grant ${service} read access.`:r.status===403?`${service} denied access. Check this Google account’s property permissions, API activation, and granted consent.`:r.status===401?'Google authorization expired. Reconnect this website.':`${service} could not return this report. Try again or reconnect.`;
  throw new HttpError(r.status===429?429:502,message);
 }
 return r.json();
}
export async function properties(token:string){
 const result:{id:string,name:string,account:string}[]=[];let page='';
 do{
  const data=await google('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200'+(page?'&pageToken='+encodeURIComponent(page):''),token);
  for(const a of data.accountSummaries||[])for(const p of a.propertySummaries||[])result.push({id:p.property,name:p.displayName,account:a.displayName});
  page=data.nextPageToken||'';
 }while(page);
 return result;
}


