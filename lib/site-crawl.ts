import {load} from 'cheerio/slim';
import {validateUrl,publicHost,robotsRules,allowed,requestPage,limitedText,parsePage,analyze,type Page,type Rule} from './crawler.ts';
type Target={url:string,depth:number,kind:'page'|'sitemap'};
export type CrawlState={origin:string,start:string,limit:number,initialized:boolean,rules:Rule[],pending:Target[],seen:string[],pages:Page[],blocked:number,skipped:number,sitemaps:number,sitemapFound:boolean,discoveryLimited:boolean,robots:boolean};
export function newCrawl(url:string,limit:number):CrawlState{const u=validateUrl(url);return {origin:u.origin,start:u.href,limit,initialized:false,rules:[],pending:[],seen:[],pages:[],blocked:0,skipped:0,sitemaps:0,sitemapFound:false,discoveryLimited:false,robots:false}}
export function enqueue(s:CrawlState,raw:string,depth:number,kind:Target['kind']='page'){
 let u:URL;try{u=new URL(raw,s.start)}catch{return}
 u.hash='';if(u.origin!==s.origin||u.username||u.password||!['http:','https:'].includes(u.protocol))return;
 if(kind==='page'&&(u.search||/\.(pdf|jpe?g|png|gif|svg|zip|mp4|css|js|webp|ico|woff2?|gz)$/i.test(u.pathname)))return;
 const key=kind+':'+u.href;if(s.seen.includes(key))return;
 if(s.seen.length>=20000){s.discoveryLimited=true;return}
 s.seen.push(key);
 if(!allowed(u.pathname+u.search,s.rules)){s.blocked++;return}
 s.pending.push({url:u.href,depth,kind});
}
export async function crawlStep(s:CrawlState){
 // Revalidate the only allowed host on every resumed batch, including after a restart.
 await publicHost(new URL(s.start).hostname);
 if(!s.initialized){
  const {r}=await requestPage(s.origin+'/robots.txt',s.origin);
  if(![200,404,410].includes(r.status)){await r.body?.cancel();throw Error('Robots policy could not be verified. Retry when robots.txt is available.')}
  const text=r.status===200?await limitedText(r,500000):'';if(r.status!==200)await r.body?.cancel();
  s.rules=robotsRules(text);s.robots=r.status===200;s.initialized=true;
  if(!allowed(new URL(s.start).pathname+new URL(s.start).search,s.rules))throw Error('robots.txt disallows this starting URL.');
  enqueue(s,s.start,0);enqueue(s,s.origin+'/sitemap.xml',0,'sitemap');
  for(const line of text.split(/\r?\n/)){const m=line.match(/^\s*sitemap:\s*(\S+)/i);if(m)enqueue(s,m[1],0,'sitemap')}
  return s;
 }
 const target=s.pending.shift();if(!target)return s;
 if(target.kind==='sitemap'){
  if(s.sitemaps>=50){s.discoveryLimited=true;return s} s.sitemaps++;
  try{const {r}=await requestPage(target.url,s.origin,s.rules);if(!r.ok){await r.body?.cancel();return s}const xml=await limitedText(r,2000000),$=load(xml,{xmlMode:true});if(!$('urlset,sitemapindex').length)return s;s.sitemapFound=true;$('sitemap > loc').each((_,e)=>enqueue(s,$(e).text().trim(),0,'sitemap'));$('url > loc').each((_,e)=>enqueue(s,$(e).text().trim(),0));}catch{s.discoveryLimited=true}
  return s;
 }
 try{
  const began=Date.now(),{r,url,redirects}=await requestPage(target.url,s.origin,s.rules);const type=r.headers.get('content-type')||'';
  if(r.status<400&&!/text\/html|application\/xhtml\+xml/.test(type)){await r.body?.cancel();s.skipped++;return s}
  const page=await parsePage(await limitedText(r),url,r.status,Date.now()-began,target.depth,redirects,r.headers.get('x-robots-tag')||'');
  if(page.status<400&&!/\b(nofollow|none)\b/i.test(page.robots))for(const link of page.internalLinks)enqueue(s,link,target.depth+1);
  // Bound persisted evidence while retaining all discovered crawl destinations.
  page.internalLinks=page.internalLinks.slice(0,100);page.externalLinks=page.externalLinks.slice(0,100);page.h1=page.h1.slice(0,30);page.h2=page.h2.slice(0,100);page.title=page.title.slice(0,2000);page.description=page.description.slice(0,4000);
  s.pages.push(page);
 }catch(e){s.pages.push({url:target.url,status:0,error:e instanceof Error?e.message:'Fetch failed',title:'',description:'',h1:[],h2:[],canonical:'',robots:'',indexable:false,words:0,internalLinks:[],externalLinks:[],images:0,imageUrls:[],missingAlt:0,schema:0,viewport:false,og:false,responseTime:0,size:0,depth:target.depth,redirects:[]})}
 return s;
}
export function finished(s:CrawlState){return s.initialized&&(!s.pending.length||s.pages.length>=s.limit)}
export function crawlReport(s:CrawlState){
 const result=analyze(s.pages,{robots:s.robots,sitemap:s.sitemapFound});
 const descriptions=new Map<string,Page[]>();for(const p of s.pages.filter(p=>!p.error&&p.status<400&&p.description)){const list=descriptions.get(p.description)||[];list.push(p);descriptions.set(p.description,list)}
 const duplicates=[...descriptions.values()].filter(a=>a.length>1).flat();if(duplicates.length)result.issues.push({title:'Review duplicate meta descriptions',severity:'Medium',category:'SEO',urls:duplicates.map(p=>p.url),why:'These crawled pages share a meta description.',fix:'Write a description specific to each page’s purpose.',effort:'15–30 min',confidence:'High'});
 const failed=new Set(s.pages.filter(p=>p.status>=400).map(p=>p.url));
 const sources=s.pages.filter(p=>!p.error&&p.status<400&&p.internalLinks.some(url=>failed.has(url)));
 if(sources.length)result.issues.push({title:'Fix links to unavailable internal pages',severity:'High',category:'Technical SEO',urls:sources.map(p=>p.url),why:'A saved internal link on these pages points to a URL that returned an HTTP error during this crawl.',fix:'Review the internal-link evidence, then repair the destination or update the link to a relevant live page.',effort:'15–30 min',confidence:'High'});
 const partial=s.pending.length>0||s.discoveryLimited;
 return {...result,pages:s.pages,mode:'full-site',coverage:`${s.pages.length}/${s.limit} page limit · ${partial?'partial crawl — limit or discovery constraint':'discovered crawlable URLs checked'} · ${s.blocked} blocked by robots · ${s.skipped} non-HTML URLs skipped · HTML only`,source:'Observed HTML crawl; deterministic recommendations',limitations:['Same origin only; query-string links excluded','No JavaScript rendering; not a guarantee that every website page was discovered','Up to 50 XML sitemaps and 20,000 discovered URLs','Link evidence capped at 100 internal and 100 external URLs per page','No backlink or search-ranking data']};
}

