import {normalizePageSpeed} from './pagespeed-report';
export interface PerformanceProvider {measure(url:string,strategy:'mobile'|'desktop'):Promise<unknown>}
export interface AIProvider {recommend(context:{pages:unknown[],issues:unknown[]}):Promise<{text:string,source:string}>}
export interface SearchDataProvider {getMetrics(projectId:string,from:string,to:string):Promise<unknown>}
export class PageSpeedProvider implements PerformanceProvider {
 async measure(url:string,strategy:'mobile'|'desktop') {
  try {
   const endpoint=new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
   endpoint.searchParams.set('url',url);endpoint.searchParams.set('strategy',strategy);
   for(const category of ['performance','accessibility','best-practices','seo'])endpoint.searchParams.append('category',category);
   const r=await fetch(endpoint,{signal:AbortSignal.timeout(60000)});
   if(!r.ok)return {status:'unavailable',reason:r.status===429?'Google PageSpeed quota is temporarily exhausted. Retry later.':`Google PageSpeed returned HTTP ${r.status}.`};
   return normalizePageSpeed(await r.json(),strategy);
  }catch{return {status:'unavailable',reason:'Google PageSpeed could not complete this test within 60 seconds. Run a new audit to retry.'}}
 }
}
export class UnconfiguredAIProvider implements AIProvider {async recommend(){return {text:'AI provider is not configured. Rule-based recommendations remain available.',source:'unavailable'}}}

