export const sections = [
  {id:'home',label:'Home',description:'Your websites and latest results',tools:['Dashboard']},
  {id:'seo',label:'SEO',description:'Audit, research, and improve search performance',tools:['Site Audit','Top Pages','Position Tracking','Keyword Overview','Keyword Research','Keyword Lists','Competitors','Backlinks','Action Plan']},
  {id:'ai',label:'AI Visibility',description:'Track prompts and record brand mentions',tools:['Prompt Research','Prompt Tracking','Brand Mentions']},
  {id:'traffic',label:'Traffic & Market',description:'Analyze measured acquisition and engagement',tools:['Website Performance','Traffic Analytics','Country Rankings','Marketing Channels','Organic Search','Paid Search','Referrals','Social Traffic','Market Research']},
  {id:'local',label:'Local',description:'Manage listings, reviews, and local search work',tools:['Business Listings','Review Management','Local Rank Tracking']},
  {id:'content',label:'Content',description:'Plan, write, and optimize your content',tools:['My Content','SEO Brief Generator','Content Optimizer','Topic Research']},
  {id:'ads',label:'Advertising',description:'Plan campaigns and analyze campaign results',tools:['Campaign Planner','Advertising Research']},
  {id:'pr',label:'AI PR',description:'Organize contacts, coverage, and outreach drafts',tools:['Media Contacts','Media Monitoring','Outreach Drafts']},
  {id:'social',label:'Social',description:'Create posts and keep your publishing calendar',tools:['Social Calendar','Social Analytics']},
  {id:'reports',label:'Reports',description:'Export results from your actual website audits',tools:['Audit Reports','Saved Reports']},
  {id:'apps',label:'Apps',description:'Connect your sources of truth',tools:['Data Sources']},
] as const;
export type Field = {key:string,label:string,type?:'number'|'date'|'url'|'textarea',required?:boolean};
export type RecordConfig = {kind:string,description:string,fields:Field[],source?:string};
export const majorCountries=['United States','India','United Kingdom','Canada','Australia','Germany','France','Japan','Brazil','Mexico','Singapore','United Arab Emirates','Saudi Arabia','South Africa','Netherlands'];
const title = (label:string):Field=>({key:'title',label,required:true});
const notes:Field={key:'notes',label:'Notes / evidence',type:'textarea'};
const url:Field={key:'url',label:'Source URL',type:'url'};
const date:Field={key:'date',label:'Observation date',type:'date',required:true};
export const recordTools:Record<string,RecordConfig> = {
 'Website Performance':{kind:'web-performance',description:'Save measured visits and engagement metrics for a reporting period.',source:'Import from Similarweb, GA4, or another analytics provider.',fields:[title('Website'),date,{key:'visits',label:'Total visits',type:'number',required:true},{key:'users',label:'Unique visitors',type:'number'},{key:'pagesPerVisit',label:'Pages per visit',type:'number'},{key:'bounceRate',label:'Bounce rate (%)',type:'number'},{key:'avgDuration',label:'Average visit duration'},{key:'source',label:'Data provider',required:true},notes]},
 'Marketing Channels':{kind:'marketing-channel',description:'Compare measured acquisition channels by visits and share.',fields:[title('Channel'),date,{key:'visits',label:'Visits',type:'number',required:true},{key:'share',label:'Traffic share (%)',type:'number'},{key:'source',label:'Data provider',required:true},notes]},
 'Paid Search':{kind:'paid-search',description:'Record paid search terms, visits, clicks, and spend from your advertising provider.',fields:[title('Keyword / campaign'),date,{key:'clicks',label:'Clicks',type:'number'},{key:'visits',label:'Visits',type:'number'},{key:'spend',label:'Spend',type:'number'},{key:'cpc',label:'CPC',type:'number'},{key:'source',label:'Data provider',required:true},notes]},
 'Referrals':{kind:'referral',description:'Save measured referring domains and traffic share.',fields:[title('Referring domain'),date,{key:'visits',label:'Visits',type:'number',required:true},{key:'share',label:'Traffic share (%)',type:'number'},url,notes]},
 'Social Traffic':{kind:'social-traffic',description:'Record measured social networks sending traffic to your website.',fields:[title('Network'),date,{key:'visits',label:'Visits',type:'number',required:true},{key:'share',label:'Traffic share (%)',type:'number'},url,notes]},
 'Country Rankings':{kind:'country-rank',description:'Compare your website’s measured country rank, traffic share, and visits across major markets.',source:'Country ranks and visits require a traffic intelligence provider such as Similarweb. A page crawl cannot calculate them.',fields:[title('Website'),{key:'country',label:'Country',required:true},{key:'rankType',label:'Rank type',required:true},{key:'rank',label:'Country rank',type:'number',required:true},{key:'visits',label:'Monthly visits',type:'number'},{key:'share',label:'Traffic share (%)',type:'number'},{key:'category',label:'Industry / category'},{key:'date',label:'Reporting month',type:'date',required:true},{key:'source',label:'Data provider',required:true},url,notes]},
 'Keyword Lists':{kind:'keyword-list',description:'Organize the keywords you selected in Keyword Overview into named lists and turn them into content plans.',fields:[title('Keyword'),{key:'list',label:'List name',required:true},{key:'country',label:'Country',required:true},{key:'language',label:'Language',required:true},notes]},
 'Position Tracking':{kind:'rank',description:'Save dated keyword positions with the search engine, country, and evidence you observed.',source:'Manual observations; automatic SERP tracking requires a search data provider.',fields:[title('Keyword'),{key:'position',label:'Position',type:'number',required:true},{key:'market',label:'Search engine / country',required:true},date,url]},
 'Keyword Research':{kind:'keyword',description:'Build a research list with supplied search-volume data and intent.',source:'Search volumes are supplied by you, never estimated from a crawl.',fields:[title('Keyword'),{key:'intent',label:'Search intent'},{key:'volume',label:'Monthly search volume',type:'number'},{key:'difficulty',label:'SEO difficulty',type:'number'},{key:'cpc',label:'CPC',type:'number'},{key:'currency',label:'Currency (e.g. USD)'},{key:'paidDifficulty',label:'Paid difficulty',type:'number'},{key:'country',label:'Country'},{key:'language',label:'Language'},{key:'source',label:'Data provider'},date,notes]},
 'Competitors':{kind:'competitor',description:'Maintain a research shortlist and evidence for each competitor.',fields:[title('Competitor'),{...url,required:true},notes]},
 'Backlinks':{kind:'backlink',description:'Record incoming links found in your backlink exports or research.',source:'A website crawl only finds outgoing links. Incoming links need a backlink dataset.',fields:[title('Link title'),{...url,label:'Referring page URL',required:true},{key:'target',label:'Target URL',type:'url',required:true},date,notes]},
 'Prompt Research':{kind:'prompt',description:'Build the questions your potential customers ask AI assistants.',fields:[title('Prompt'),{key:'intent',label:'Intent / audience'},notes]},
 'Prompt Tracking':{kind:'prompt-result',description:'Save actual model responses, dates, and citations for repeatable comparisons.',source:'Recorded observations; these are not automated visibility measurements.',fields:[title('Prompt'),{key:'model',label:'Model / platform',required:true},date,{key:'response',label:'Observed response',type:'textarea',required:true},url]},
 'Brand Mentions':{kind:'mention',description:'Record observed mentions and their source evidence.',fields:[title('Brand / mention'),{key:'platform',label:'Platform',required:true},date,{...url,required:true},notes]},
 'Traffic Analytics':{kind:'traffic',description:'Record metrics from your analytics reports, including period and source.',source:'Measured traffic requires your analytics data; audits cannot measure visitors.',fields:[title('Channel'),date,{key:'sessions',label:'Sessions',type:'number',required:true},{key:'users',label:'Users',type:'number'},{key:'source',label:'Analytics source / property',required:true},notes]},
 'Organic Search':{kind:'search',description:'Save Search Console query observations for a specific date or reporting period.',fields:[title('Query'),date,{key:'clicks',label:'Clicks',type:'number',required:true},{key:'impressions',label:'Impressions',type:'number',required:true},{key:'position',label:'Average position',type:'number'},notes]},
 'Market Research':{kind:'market',description:'Collect market findings with sources and observations.',fields:[title('Finding'),date,{...url,required:true},notes]},
 'Business Listings':{kind:'listing',description:'Maintain your business listing directory and verification checklist.',fields:[title('Business name'),{key:'address',label:'Address',required:true},{key:'phone',label:'Phone'},{...url,label:'Listing URL'},notes]},
 'Review Management':{kind:'review',description:'Record reviews and prepare responses for publication on the original platform.',fields:[title('Reviewer / platform'),date,{key:'rating',label:'Rating (1–5)',type:'number',required:true},{key:'review',label:'Review',type:'textarea',required:true},{key:'reply',label:'Reply draft',type:'textarea'},url]},
 'Local Rank Tracking':{kind:'local-rank',description:'Record map search positions with a precise location and date.',fields:[title('Keyword'),{key:'location',label:'Search location',required:true},{key:'position',label:'Observed rank',type:'number',required:true},date,url]},
 'My Content':{kind:'content',description:'Save and edit content drafts. Export a draft when it is ready for your CMS.',fields:[title('Title'),{key:'keyword',label:'Primary keyword'},{key:'body',label:'Content',type:'textarea',required:true},notes]},
 'Topic Research':{kind:'topic',description:'Keep evidence-backed topic ideas and audience questions.',fields:[title('Topic'),{key:'audience',label:'Audience'},{key:'questions',label:'Questions to answer',type:'textarea'},url]},
 'Campaign Planner':{kind:'campaign',description:'Plan a campaign budget, objective, and creative. Saving does not launch ads or spend money.',fields:[title('Campaign'),{key:'channel',label:'Ad platform',required:true},{key:'budget',label:'Planned budget',type:'number'},{key:'currency',label:'Currency'},{key:'date',label:'Planned start',type:'date'},notes]},
 'Advertising Research':{kind:'ad-research',description:'Collect observed competitor ads and landing-page evidence.',fields:[title('Advertiser / creative'),{...url,required:true},date,notes]},
 'Media Contacts':{kind:'contact',description:'Build a private media list for your own outreach.',fields:[title('Contact name'),{key:'outlet',label:'Publication'},{key:'email',label:'Email'},{key:'beat',label:'Topics covered'},url]},
 'Media Monitoring':{kind:'coverage',description:'Save published coverage with the original source.',fields:[title('Headline'),{...url,required:true},date,notes]},
 'Outreach Drafts':{kind:'outreach',description:'Draft pitches and export them for review. No email is sent from this workspace.',fields:[title('Subject'),{key:'recipient',label:'Recipient'},{key:'body',label:'Email draft',type:'textarea',required:true}]},
 'Social Calendar':{kind:'social-post',description:'Plan posts by channel and date. Planned posts need publication in the social platform.',fields:[title('Post title'),{key:'channel',label:'Channel',required:true},{key:'date',label:'Planned date',type:'date',required:true},{key:'body',label:'Post copy',type:'textarea',required:true},url]},
 'Social Analytics':{kind:'social-metric',description:'Record measured social performance with a source and reporting date.',fields:[title('Account / channel'),date,{key:'reach',label:'Reach',type:'number'},{key:'engagements',label:'Engagements',type:'number'},url,notes]},
 'Saved Reports':{kind:'report',description:'Save report commentary and observations alongside your downloadable audit results.',fields:[title('Report title'),date,{key:'body',label:'Report commentary',type:'textarea',required:true}]},
};
export function validateRecord(kind:unknown,data:unknown){
 const config=Object.values(recordTools).find(c=>c.kind===kind);
 if(!config||!data||typeof data!=='object'||Array.isArray(data))throw Error('Choose a valid tool and provide its fields.');
 const out:Record<string,string>={};
 for(const f of config.fields){const raw=(data as Record<string,unknown>)[f.key];const v=typeof raw==='string'?raw.trim():'';
  if(f.required&&!v)throw Error(`${f.label} is required.`);
  if(v.length>(f.type==='textarea'?8000:500))throw Error(`${f.label} is too long.`);
  if(v&&f.type==='number'&&(!Number.isFinite(Number(v))||Number(v)<0))throw Error(`${f.label} must be a non-negative number.`);
  if(v&&f.type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))))throw Error('Use a valid date.');
  if(v&&f.type==='url'){const u=new URL(v);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('Use a public HTTP or HTTPS source URL.');}
  out[f.key]=v;
 }
 if(kind==='keyword'){for(const key of ['difficulty','paidDifficulty'])if(out[key]&&Number(out[key])>100)throw Error('Difficulty scores must be between 0 and 100.');if(out.currency&&!/^[A-Za-z]{3}$/.test(out.currency))throw Error('Use a three-letter currency code.');}
 if(kind==='review'&&(Number(out.rating)<1||Number(out.rating)>5))throw Error('Ratings must be between 1 and 5.');
 return out;
}
