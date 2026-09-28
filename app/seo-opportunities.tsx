'use client';
import {useEffect,useState} from 'react';
import {seoOpportunities,type Opportunity} from '@/lib/seo-opportunities';
import './seo-toolkit.css';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
export default function SeoOpportunities({projectId,audit,records,onSave,onSaveBrief,onOpenContent}:{projectId:string,audit:any,records:any[],onSave:(data:Record<string,string>)=>Promise<void>,onSaveBrief:(data:Record<string,string>)=>Promise<void>,onOpenContent:()=>void}){
 const [brief,setBrief]=useState<Opportunity|null>(null),[briefTitle,setBriefTitle]=useState(''),[briefBody,setBriefBody]=useState(''),[briefBusy,setBriefBusy]=useState(false),[briefError,setBriefError]=useState(''),[briefSaved,setBriefSaved]=useState(false);
 function startBrief(o:Opportunity){
  const page=audit?.pages?.find((p:any)=>p.url===o.url);
  const brand=records.filter(r=>r.kind==='brand-profile').sort((a,b)=>b.updated_at.localeCompare(a.updated_at))[0]?.data;
  const parts=['# Improvement brief: '+o.title,'Page: '+(o.url||'See affected pages in the audit'),'Source: '+o.source,'Priority: '+o.priority,
   '## Evidence',o.evidence,'## Recommended action',o.action,
   ...(page?['## Current page metadata','Title: '+(page.title||'Not observed'),'Description: '+(page.description||'Not observed')]:[]),
   ...(brand?['## Brand context (review before use)','Brand: '+brand.title,'Audience: '+(brand.audience||'Not specified'),'Voice: '+(brand.voice||'Not specified')]:[]),
   '## Proposed changes','[Describe the specific edits or technical fix. Confirm the evidence on the live page.]',
   '## Review checklist','- Verify all claims and preserve useful existing content.','- Check the changed page on mobile and desktop.','- Rerun the relevant audit after implementation.','- Compare performance over an equivalent period; changes alone do not prove causation.'];
  setBrief(o);setBriefTitle(('Brief: '+o.title).slice(0,500));setBriefBody(parts.join('\n\n').slice(0,8000));setBriefError('');setBriefSaved(false);
 }
 async function saveBrief(){if(!brief)return;setBriefBusy(true);setBriefError('');try{await onSaveBrief({title:briefTitle.trim(),body:briefBody.trim(),keyword:'',notes:('Source: '+brief.source+' · '+brief.url).slice(0,8000)});setBriefSaved(true)}catch(e){setBriefError((e as Error).message)}finally{setBriefBusy(false)}}
 const [search,setSearch]=useState<any>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0),[saving,setSaving]=useState(''),[source,setSource]=useState('All'),[saveError,setSaveError]=useState('');
 useEffect(()=>{const controller=new AbortController();let active=true;setLoading(true);setSearch(null);setError('');fetch('/api/analytics/search?projectId='+encodeURIComponent(projectId)+'&days=28',{signal:controller.signal,cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||'Search Console unavailable');if(active){setSearch(d);if(d.reports?.pages?.status==='unavailable')setError(d.reports.pages.error)}}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false;controller.abort()}},[projectId,revision]);
 const opportunities=seoOpportunities(audit,search),visible=opportunities.filter(o=>source==='All'||o.source===source);
 const saved=(o:Opportunity)=>records.some(r=>r.kind==='seo-opportunity'&&r.data.title===o.title&&r.data.url===o.url);
 async function save(o:Opportunity){setSaving(o.id);setSaveError('');try{await onSave({title:o.title,url:o.url,priority:o.priority,source:o.source,evidence:o.evidence,action:o.action,status:'Open',date:new Date().toISOString().slice(0,10)})}catch(e){setSaveError((e as Error).message)}finally{setSaving('')}}
 return <section className="suite-panel toolkit"><header><h2>SEO Opportunity Feed</h2><p>Prioritized actions from your latest crawl and the last 28 days of Search Console data.</p><button disabled={loading} onClick={()=>setRevision(v=>v+1)}>Refresh Search Console</button></header><div className="toolkit-body">
 <p>{audit?'Crawl: '+new Date(audit.created_at).toLocaleString():'No saved crawl. Run a site audit to include technical findings.'}</p>
 {loading&&<p role="status">Loading search opportunities…</p>}{error&&<p role="alert" className="suite-note">Search Console: {error} <a href={'/analytics?projectId='+encodeURIComponent(projectId)}>Manage connection →</a></p>}
 {search&&<p>Property: {search.site} · {search.startDate}–{search.endDate}. Search opportunities cover only the API’s top 20 pages by clicks, not every page. Finalized data may be delayed.</p>}
 <label>Source<select value={source} onChange={e=>setSource(e.target.value)}>{['All','HTML crawl','Search Console'].map(s=><option key={s}>{s}</option>)}</select></label><p>{visible.length} opportunities · Saved items appear under SEO → Saved Opportunities, where you can update their status.</p>
 {saveError&&<p role="alert" className="suite-error">{saveError}</p>}
 {!visible.length&&!loading&&<p>No opportunities match the available data and current rules. This is not a complete SEO health assessment.</p>}
 {visible.map(o=><article key={o.id} className="toolkit-preview"><span className={'suite-severity '+o.priority}>{o.priority}</span> <small>{o.source}</small><h3>{o.title}</h3><p style={{overflowWrap:'anywhere'}}>{o.url}</p><p><strong>Evidence: </strong>{o.evidence}</p><p><strong>Next action: </strong>{o.action}</p><div className="suite-actions"><button disabled={!!saving||saved(o)} onClick={()=>void save(o)}>{saved(o)?'Saved':saving===o.id?'Saving…':'Save opportunity'}</button><button onClick={()=>startBrief(o)}>Create improvement brief</button></div></article>)}
 <Dialog open={!!brief} onOpenChange={open=>{if(!open&&!briefBusy)setBrief(null)}}><DialogContent className="suite-dialog toolkit"><DialogTitle>Improvement brief</DialogTitle><DialogDescription>An editable template based on this opportunity and your saved brand context. Review it before saving to My Content.</DialogDescription>
 {briefSaved?<><p role="status">Saved to Content → My Content.</p><button onClick={()=>{setBrief(null);onOpenContent()}}>Open My Content →</button></>:<><label>Title<input maxLength={500} value={briefTitle} disabled={briefBusy} onChange={e=>setBriefTitle(e.target.value)}/></label><label>Brief<textarea rows={14} maxLength={8000} value={briefBody} disabled={briefBusy} onChange={e=>setBriefBody(e.target.value)}/></label><small>{briefBody.length} / 8,000 characters</small>{briefError&&<p role="alert" className="suite-error">{briefError}</p>}<button disabled={briefBusy||!briefTitle.trim()||!briefBody.trim()} onClick={()=>void saveBrief()}>{briefBusy?'Saving…':'Save to My Content'}</button></>}
 </DialogContent></Dialog>
 </div></section>
}
