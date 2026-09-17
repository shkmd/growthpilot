export type ResearchRecord={id:string,kind:string,data:Record<string,string>,updated_at:string};
export type ResearchPage={url:string,title?:string,h1?:string[],h2?:string[],description?:string,error?:string};
export const normalize=(s:string)=>s.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase();
export function numeric(value:unknown){if(typeof value!=='string'||!value.trim())return null;const n=Number(value);return Number.isFinite(n)&&n>=0?n:null;}
export function keywordRows(records:ResearchRecord[],country:string,language:string){
 const latest=new Map<string,ResearchRecord>();
 for(const r of records){if(r.kind!=='keyword'||normalize(r.data.country||'')!==normalize(country)||normalize(r.data.language||'')!==normalize(language))continue;
  const key=normalize(r.data.title)+'|'+normalize(r.data.source||'');const prev=latest.get(key);
  if(!prev||(r.data.date||r.updated_at)>(prev.data.date||prev.updated_at)||((r.data.date||'')===(prev.data.date||'')&&r.updated_at>prev.updated_at))latest.set(key,r);
 }return [...latest.values()];
}
export function suggestIdeas(keyword:string,category:string){const k=keyword.trim();if(!k)return [];
 const sets:Record<string,string[]>={Questions:[`What is ${k}?`,`How does ${k} work?`,`How much does ${k} cost?`,`How to choose ${k}?`,`When should you use ${k}?`],Comparisons:[`${k} alternatives`,`${k} vs other options`,`best ${k}`,`${k} pros and cons`],Modifiers:[`${k} for beginners`,`${k} for small businesses`,`${k} near me`,`${k} checklist`,`${k} examples`]};
 return sets[category]||[];
}
export function coverage(keyword:string,pages:ResearchPage[]){const term=normalize(keyword);if(!term)return [];return pages.filter(p=>!p.error).map(p=>({url:p.url,title:p.title||'',matches:[p.title&&normalize(p.title).includes(term)?'Title':'',p.h1?.some(h=>normalize(h).includes(term))?'H1':'',p.h2?.some(h=>normalize(h).includes(term))?'H2':'',p.description&&normalize(p.description).includes(term)?'Description':''].filter(Boolean)})).filter(p=>p.matches.length);}
export function researchBrief(keyword:string,pages:ResearchPage[],rows:ResearchRecord[],country:string,language:string){
 const exact=rows.filter(r=>normalize(r.data.title)===normalize(keyword));const matched=coverage(keyword,pages);
 return `# Content brief: ${keyword}\n\nTarget market: ${country}\nLanguage: ${language}\n\n## Objective\nAnswer the reader's question about ${keyword}. Verify audience and intent before writing.\n\n## Measured keyword data\n${exact.length?exact.map(r=>`- ${r.data.source||'Unspecified source'} (${r.data.date||'undated'}): volume ${r.data.volume||'unavailable'}, SEO difficulty ${r.data.difficulty||'unavailable'}, CPC ${r.data.cpc||'unavailable'} ${r.data.currency||''}.`).join('\n'):'No matching measurements supplied. Validate demand before prioritizing.'}\n\n## Questions to investigate\n${suggestIdeas(keyword,'Questions').map(q=>'- '+q).join('\n')}\n\n## Existing page coverage\n${matched.length?matched.map(p=>`- ${p.url} — ${p.matches.join(', ')}`).join('\n'):'No exact phrase match in the crawled titles, headings or descriptions. This is partial crawl coverage, not proof the topic is absent.'}\n\n## Outline\n- Direct answer and scope\n- Practical steps with original examples\n- Alternatives and limitations\n- Frequently asked questions\n\n## Editorial checklist\n- Verify factual claims and cite original sources.\n- Review existing pages before creating overlapping content.\n- Add relevant internal links.\n- Write a unique title and description.\n\nSource: deterministic planning template using supplied data and observed page metadata; not an AI-generated analysis.`;
}
