'use client';
import {useEffect,useRef,useState} from 'react';
import './seo-toolkit.css';
export default function AiWriter({projectId,records,onSave,onOpenContent}:{projectId:string,records:any[],onSave:(data:Record<string,string>)=>Promise<void>,onOpenContent:()=>void}){
 const [selected,setSelected]=useState(''),[draft,setDraft]=useState(''),[title,setTitle]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[saved,setSaved]=useState(false);
 const mounted=useRef(true);useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 const sources=records.filter(r=>r.kind==='content'),source=sources.find(r=>r.id===selected);
 async function generate(){if(!source)return;if(draft&&!confirm('Replace the current unsaved draft?'))return;setBusy(true);setError('');try{const r=await fetch('/api/content-draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,recordId:source.id})});const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to generate a draft.');if(mounted.current){setDraft(d.draft);setTitle(('Draft: '+source.data.title).slice(0,500));setSaved(false)}}catch(e){if(mounted.current)setError((e as Error).message)}finally{if(mounted.current)setBusy(false)}}
 async function save(){if(!source)return;setBusy(true);setError('');try{await onSave({title:title.trim(),body:draft.trim(),keyword:source.data.keyword||'',notes:('AI-assisted draft. Source brief: '+source.data.title+' (record '+source.id+'). Review all claims before publishing.').slice(0,8000)});if(mounted.current)setSaved(true)}catch(e){if(mounted.current)setError((e as Error).message)}finally{if(mounted.current)setBusy(false)}}
 return <section className="suite-panel toolkit"><header><h2>AI Writer</h2><p>Turn a saved brief into an editable article or implementation guide for this website.</p></header><div className="toolkit-body">
 {!sources.length?<><p>Save a brief from the Opportunity Feed, or add content in My Content, to get started.</p><button onClick={onOpenContent}>Open My Content →</button></>:<>
 <label>Saved brief / source content<select disabled={busy} value={selected} onChange={e=>{if(draft&&!saved&&!confirm('Discard the unsaved draft and change source?'))return;setSelected(e.target.value);setDraft('');setTitle('');setError('');setSaved(false)}}><option value="">Select a source</option>{sources.map(r=><option key={r.id} value={r.id}>{r.data.title}</option>)}</select></label>
 {source&&<details><summary>Review source brief</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:250,overflow:'auto'}}>{source.data.body}</pre></details>}
 <p>Generation sends the selected source and latest brand profile to OpenAI. Review factual claims and any [VERIFY] placeholders. Saving creates a new draft and preserves the source.</p>
 <button disabled={!source||busy} onClick={()=>void generate()}>{busy?'Working…':'Generate article draft'}</button>
 {draft&&<><label>Draft title<input maxLength={500} disabled={busy||saved} value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Article (Markdown)<textarea rows={22} maxLength={8000} disabled={busy||saved} value={draft} onChange={e=>setDraft(e.target.value)}/></label><p>{draft.length} / 8,000 characters · Draft only; no automatic publication.</p>
 {saved?<><p role="status">Saved to My Content. Continue editing there.</p><button onClick={onOpenContent}>Open My Content →</button></>:<button disabled={busy||!title.trim()||!draft.trim()} onClick={()=>void save()}>Save draft to My Content</button>}</>}
 </>}{busy&&<p role="status">Please wait…</p>}{error&&<p role="alert" className="suite-error">{error}</p>}
 </div></section>
}
