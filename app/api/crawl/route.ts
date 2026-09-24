import {claimCrawlSQL,saveCrawlSQL,insertCrawlAuditSQL} from '@/lib/crawl-job-sql';
import {body,db,fail,owner,ownedProject,textValue,HttpError} from '@/lib/server';
import {newCrawl,crawlStep,finished,crawlReport,type CrawlState} from '@/lib/site-crawl';
type Job={project_id:string,owner:string,status:string,state:string,lease:string,lease_until:number,message:string,updated_at:string};
async function read(project:string,user:string){return db().prepare('SELECT * FROM crawl_jobs WHERE project_id=? AND owner=?').bind(project,user).first<Job>()}
function summary(job:Job|null){if(!job)return null;const s=JSON.parse(job.state) as CrawlState;return {status:job.status,pages:s.pages.length,queued:s.pending.length,discovered:s.seen.filter(u=>u.startsWith('page:')).length,limit:s.limit,blocked:s.blocked,skipped:s.skipped,message:job.message,updatedAt:job.updated_at,current:s.pending[0]?.url||'',initialized:s.initialized}}
const response=(job:Job|null)=>Response.json({job:summary(job)},{headers:{'Cache-Control':'private, no-store'}});
export async function GET(request:Request){try{const user=await owner(),id=textValue(new URL(request.url).searchParams.get('projectId'));await ownedProject(id,user);return response(await read(id,user))}catch(e){return fail(e)}}
export async function POST(request:Request){try{
 const user=await owner(request),b=await body(request),id=textValue(b.projectId),project=await ownedProject(id,user),now=Date.now(),stamp=new Date().toISOString();
 let job=await read(id,user);
 if(b.action==='start'){
  if(!Number.isInteger(b.limit)||b.limit<10||b.limit>2000)throw new HttpError(400,'Choose a page limit between 10 and 2,000.');
  const active=await db().prepare("SELECT project_id FROM crawl_jobs WHERE owner=? AND status='running'").bind(user).first();if(active)throw new HttpError(409,'Pause the active crawl before starting another.');
  const day=stamp.slice(0,10);const quota=await db().prepare('INSERT INTO audit_limits (owner,last_started,day,count) VALUES (?,?,?,1) ON CONFLICT(owner) DO UPDATE SET last_started=excluded.last_started,day=excluded.day,count=CASE WHEN audit_limits.day=excluded.day THEN audit_limits.count+1 ELSE 1 END WHERE audit_limits.last_started < ? AND (audit_limits.day != ? OR audit_limits.count < 10)').bind(user,now,day,now-120000,day).run();if(!quota.meta.changes)throw new HttpError(429,'Allow 2 minutes between audit starts. Limit: 10 audit starts per day.');
  await db().prepare("INSERT INTO crawl_jobs(project_id,owner,status,state,updated_at) VALUES (?,?,'running',?,?) ON CONFLICT(project_id) DO UPDATE SET status='running',state=excluded.state,lease='',lease_until=0,message='',updated_at=excluded.updated_at WHERE crawl_jobs.owner=excluded.owner AND crawl_jobs.status!='running'").bind(id,user,JSON.stringify(newCrawl(project.url,b.limit)),stamp).run();return response(await read(id,user));
 }
 if(!job)throw new HttpError(404,'No saved crawl for this website.');
 if(b.action==='pause'){await db().prepare("UPDATE crawl_jobs SET status='paused',lease='',lease_until=0,updated_at=? WHERE project_id=? AND owner=? AND status='running'").bind(stamp,id,user).run();return response(await read(id,user))}
 if(b.action==='resume'){
  if(await db().prepare("SELECT project_id FROM crawl_jobs WHERE owner=? AND status='running' AND project_id!=?").bind(user,id).first())throw new HttpError(409,'Pause your other active crawl first.');
  await db().prepare("UPDATE crawl_jobs SET status='running',message='',updated_at=? WHERE project_id=? AND owner=? AND status='paused'").bind(stamp,id,user).run();return response(await read(id,user));
 }
 if(b.action!=='step')throw new HttpError(400,'Unknown crawl action.');
 if(job.status!=='running')return response(job);
 const lease=crypto.randomUUID();const claim=await db().prepare(claimCrawlSQL).bind(lease,now+120000,id,user,now).run();if(!claim.meta.changes)return response(await read(id,user));
 try{
  job=(await read(id,user))!;if(job.lease!==lease)return response(job);
  const state=await crawlStep(JSON.parse(job.state));const complete=finished(state);
  const statements=[];
  if(complete){const audit={id:crypto.randomUUID(),created_at:new Date().toISOString(),...crawlReport(state)};statements.push(db().prepare(insertCrawlAuditSQL).bind(audit.id,id,user,audit.created_at,audit.score,JSON.stringify(audit),id,user,lease))}
  statements.push(db().prepare(saveCrawlSQL).bind(JSON.stringify(state),complete?'complete':'running',new Date().toISOString(),id,user,lease));await db().batch(statements);
 }catch(e){await db().prepare("UPDATE crawl_jobs SET status='paused',message=?,lease='',lease_until=0,updated_at=? WHERE project_id=? AND owner=? AND lease=? AND status='running'").bind(e instanceof Error?e.message:'Crawl paused after a request failure.',new Date().toISOString(),id,user,lease).run()}
 return response(await read(id,user));
}catch(e){return fail(e)}}

