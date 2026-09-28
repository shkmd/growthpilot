export type Opportunity={id:string,title:string,priority:string,source:string,evidence:string,action:string,url:string};
export function seoOpportunities(audit:any,search:any):Opportunity[]{
 const out:Opportunity[]=(audit?.issues||[]).map((i:any,n:number)=>({id:'crawl-'+n,title:i.title,priority:i.severity||'Medium',source:'HTML crawl',evidence:i.why+' · '+i.urls.length+' affected pages',action:i.fix,url:i.urls[0]||''}));
 const seen=new Set<string>();
 if(search?.reports?.pages?.status==='available')for(const r of search.reports.pages.rows||[]){
  const url=r.keys?.[0];if(typeof url!=='string'||seen.has(url))continue;
  if(![r.impressions,r.clicks,r.ctr,r.position].every(v=>typeof v==='number'&&Number.isFinite(v))||r.impressions<100||r.ctr<0||r.ctr>1)continue;
  seen.add(url);
  const evidence=r.impressions.toLocaleString()+' impressions · '+r.clicks+' clicks · '+(r.ctr*100).toFixed(1)+'% CTR · average position '+r.position.toFixed(1)+' · '+search.startDate+' to '+search.endDate;
  if(r.position>=1&&r.position<=10&&r.ctr<0.02)out.push({id:'ctr-'+url,title:'Review a low-CTR search page',priority:'High',source:'Search Console',evidence,action:'Compare the page title and description with search intent. Review its queries in Search Console before editing; the 2% threshold is a triage rule, not an industry benchmark.',url});
  else if(r.position>10&&r.position<=20)out.push({id:'position-'+url,title:'Improve a page near the first results page',priority:'Medium',source:'Search Console',evidence,action:'Review query intent, content completeness and relevant internal links. Average position combines searches and does not guarantee a fixed ranking.',url});
 }
 const rank:Record<string,number>={Critical:0,High:1,Medium:2,Low:3};
 return out.sort((a,b)=>(rank[a.priority]??4)-(rank[b.priority]??4));
}
