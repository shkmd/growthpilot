'use client';
import './seo-toolkit.css';
export default function SocialCalendar({records,onAdd,onEdit}:{records:any[],onAdd:()=>void,onEdit:(r:any)=>void}){
 const posts=records.filter(r=>r.kind==='social-post').sort((a,b)=>String(a.data.date).localeCompare(String(b.data.date)));
 const groups=posts.reduce((m,r)=>{const key=r.data.date||'No date';(m[key] ||= []).push(r);return m},{} as Record<string,any[]>);
 return <section className="suite-panel toolkit"><header><h2>Social Calendar</h2><p>Plan and review posts by publishing date. GrowthPilot saves drafts here; publishing still happens on the original social platform.</p><button onClick={onAdd}>＋ Add post</button></header><div className="toolkit-body">{posts.length?Object.entries(groups).map(([date,items])=><div key={date} style={{marginBottom:24}}><h3>{date}</h3>{items.map((r:any)=><button key={r.id} onClick={()=>onEdit(r)} style={{display:'block',width:'100%',textAlign:'left',margin:'8px 0',padding:14,border:'1px solid var(--suite-border)',borderRadius:10,background:'var(--suite-surface)'}}><strong>{r.data.title}</strong><span style={{display:'block',opacity:.7}}>{r.data.channel} · {String(r.data.body||'').slice(0,140)}{String(r.data.body||'').length>140?'…':''}</span></button>)}</div>):<><p>No planned posts yet.</p><button onClick={onAdd}>Add your first post →</button></>}</div></section>
}
