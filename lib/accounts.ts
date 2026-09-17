import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {accountStatements} from './account-schema';
const store=()=>{if(!env.DB)throw Error('Account storage unavailable');return env.DB};
export const cookieName='growthpilot_session';
export type Account={id:string,email:string,name:string,role:string,status:string,created_at:string};
export async function initAccounts(){for(const sql of accountStatements)await store().prepare(sql).run()}
export const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('')}
export async function hashPassword(password:string,salt=randomToken()){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:600000,hash:'SHA-256'},key,256);
 return salt+':'+Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function verifyPassword(value:string,hash:string){const actual=await hashPassword(value,hash.split(':')[0]);let diff=actual.length^hash.length;for(let i=0;i<actual.length;i++)diff|=actual.charCodeAt(i)^(hash.charCodeAt(i)||0);return diff===0}
export async function currentAccount():Promise<Account|null>{
 await initAccounts();const token=(await cookies()).get(cookieName)?.value;if(!token)return null;
 return await store().prepare('SELECT u.id,u.email,u.name,u.role,u.status,u.created_at FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires>? AND u.status=\'active\'').bind(await digest(token),Date.now()).first<Account>();
}
export async function createSession(id:string,request:Request){const token=randomToken();await store().prepare('INSERT INTO sessions VALUES (?,?,?,?)').bind(await digest(token),id,Date.now()+604800000,new Date().toISOString()).run();return sessionCookie(token,request,604800)}
export function sessionCookie(token:string,request:Request,age=0){return `${cookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`}
export async function throttle(key:string){const now=Date.now();await store().prepare('INSERT INTO auth_attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<? THEN excluded.expires ELSE expires END').bind(key,now+900000,now,now).run();const row=await store().prepare('SELECT count FROM auth_attempts WHERE key=?').bind(key).first<{count:number}>();return !!row&&row.count<=10}
