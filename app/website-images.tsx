'use client';
import {useState} from 'react';

function Asset({src}:{src:string}) {
 const [failed,setFailed]=useState(false);
 return <a href={src} target="_blank" rel="noreferrer">{failed?<div className="suite-image-unavailable">Preview unavailable · Open source</div>:<img src={src} alt="Website image preview" loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>}<small>{new URL(src).pathname.split('/').pop()||'Image source'}</small></a>;
}
export default function WebsiteImages({pages,onAudit,busy}:{pages:any[],onAudit:()=>void,busy:boolean}) {
 const urls=[...new Set<string>(pages.flatMap(p=>Array.isArray(p.imageUrls)?p.imageUrls:[]))].filter(src=>{try{return ['https:','http:'].includes(new URL(src).protocol)}catch{return false}});
 return <section className="suite-panel suite-visual-inventory"><div className="suite-panelhead"><div><h2>Website images</h2><p>Images discovered in your latest HTML audit · {urls.length} unique assets</p></div><button onClick={onAudit} disabled={busy}>{busy?'Auditing…':'Refresh audit'}</button></div>{urls.length?<div className="suite-image-grid">{urls.slice(0,24).map(src=><Asset key={src} src={src}/>)}</div>:<div className="suite-empty"><h2>No image inventory yet</h2><p>Run a new audit to discover images hosted on your website. Older audits, externally hosted images, and JavaScript-only images may not include previews.</p></div>}</section>;
}
