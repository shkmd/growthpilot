import test from 'node:test';
import assert from 'node:assert/strict';
import {validateUrl,robotsRules,allowed,crawl} from '../lib/crawler.ts';

test('reject private, credentialed, non-web and custom-port targets',()=>{
 for(const url of ['http://127.0.0.1','http://2130706433','http://0x7f000001','http://[::1]','http://router.local','https://user:password@public.com','ftp://public.com','https://public.com:8443'])assert.throws(()=>validateUrl(url),undefined,url);
 assert.equal(validateUrl('public.com').href,'https://public.com/');
});
test('robots honors specific agents, wildcards, and longest allow rules',()=>{
 const all=robotsRules('User-agent: *\nDisallow: /private\nAllow: /private/public\nDisallow: /*?secret=*$');
 assert.equal(allowed('/private/account',all),false);
 assert.equal(allowed('/private/public/article',all),true);
 assert.equal(allowed('/guide?secret=yes',all),false);
 const specific=robotsRules('User-agent: *\nDisallow: /\nUser-agent: GrowthPilotBot\nAllow: /');
 assert.equal(allowed('/guide',specific),true);
});
test('crawl extracts real metadata, respects robots, and reports HTTP errors',async()=>{
 const original=globalThis.fetch;const requested=[];
 globalThis.fetch=async(input)=>{const url=String(input);requested.push(url);
  if(url.includes('dns-query'))return Response.json({Answer:[{type:1,data:'93.184.215.14'}]});
  if(url.endsWith('/robots.txt'))return new Response('User-agent: *\nDisallow: /private');
  if(url.endsWith('/sitemap.xml'))return new Response('<urlset></urlset>');
  if(url.endsWith('/broken'))return new Response('<h1>Not found</h1>',{status:404,headers:{'Content-Type':'text/html'}});
  return new Response('<html><head><title>A real title</title><meta name="viewport" content="width=device-width"></head><body><h1>One heading</h1><p>Useful page content.</p><img src="/photo.png"><a href="/broken">Broken</a><a href="/private">Private</a></body></html>',{headers:{'Content-Type':'text/html'}});
 };
 try{const data=await crawl('https://public.com');assert.equal(data.pages.length,2);assert.equal(data.pages[0].title,'A real title');assert.equal(data.pages[0].missingAlt,1);assert.ok(data.issues.some(i=>i.title==='Repair unavailable pages'));assert.ok(!requested.some(u=>u.endsWith('/private')));assert.ok(data.score>=0&&data.score<=100);assert.equal(data.source,'Observed HTML crawl; deterministic recommendations');}
 finally{globalThis.fetch=original;}
});
test('image inventory resolves and deduplicates website images, excluding external and inline sources',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(input)=>{
  const url=String(input);
  if(url.includes('dns-query'))return Response.json({Answer:[{type:1,data:'93.184.215.14'}]});
  if(url.endsWith('/robots.txt'))return new Response('User-agent: *\nAllow: /');
  if(url.endsWith('/sitemap.xml'))return new Response('<urlset/>');
  return new Response('<img src="/hero.jpg"><img src="/hero.jpg#copy"><img src="https://other.com/a.jpg"><img src="data:image/png;base64,a">',{headers:{'Content-Type':'text/html'}});
 };
 try{const result=await crawl('https://public.com');assert.deepEqual(result.pages[0].imageUrls,['https://public.com/hero.jpg']);}finally{globalThis.fetch=original;}
});
test('DNS denial stops a crawl before fetching a private destination',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({Answer:[{type:1,data:'10.0.0.4'}]})};
 try{await assert.rejects(()=>crawl('https://public.com'),/public internet address/);assert.equal(calls,1);}finally{globalThis.fetch=original}
});
