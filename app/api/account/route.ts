import {body,db,fail,HttpError,textValue} from '@/lib/server';
import {initAccounts,currentAccount,hashPassword,verifyPassword,digest,randomToken,createSession,sessionCookie,throttle} from '@/lib/accounts';
export async function GET(){try{const user=await currentAccount();return Response.json({user},{headers:{'Cache-Control':'no-store'}})}catch(e){return fail(e)}}
export async function POST(request:Request){try{
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new HttpError(403,'Invalid request origin.');
 await initAccounts();const b=await body(request),action=b.action;
 const response=(data:unknown,cookie?:string)=>Response.json(data,{headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
 if(['register','login','recover'].includes(action)){
 const email=textValue(b.email,254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HttpError(400,'Enter a valid email address.');
 if(!await throttle(await digest(action+':'+email)))throw new HttpError(429,'Too many attempts. Try again in 15 minutes.');
 const password=b.password;if(typeof password!=='string'||password.length>128||password.length<(action==='login'?1:12))throw new HttpError(400,'Use a password between 12 and 128 characters.');
 const row=await db().prepare('SELECT * FROM users WHERE email=?').bind(email).first<any>();
 if(action==='register'){
 if(row)throw new HttpError(409,'Unable to register this email. Try signing in or recovering your account.');
 const id=crypto.randomUUID(),recoveryCode=randomToken();
 await db().prepare('INSERT INTO users (id,email,name,password,recovery,created_at) VALUES (?,?,?,?,?,?)').bind(id,email,textValue(b.name,80),await hashPassword(password),await digest(recoveryCode),new Date().toISOString()).run();
 return response({recoveryCode},await createSession(id,request));
 }
 if(action==='recover'){
 if(!row||row.status!=='active'||typeof b.code!=='string'||await digest(b.code.trim())!==row.recovery)throw new HttpError(400,'Invalid email or recovery code.');
 const recoveryCode=randomToken();const result=await db().prepare('UPDATE users SET password=?,recovery=? WHERE id=? AND recovery=?').bind(await hashPassword(password),await digest(recoveryCode),row.id,row.recovery).run();
 if(!result.meta.changes)throw new HttpError(400,'Recovery code has already been used.');
 await db().prepare('DELETE FROM sessions WHERE user_id=?').bind(row.id).run();return response({recoveryCode},sessionCookie('',request));
 }
 const valid=await verifyPassword(password,row?.password||('0'.repeat(64)+':'+ '0'.repeat(64)));
 if(!row||!valid||row.status!=='active')throw new HttpError(401,'Incorrect email or password, or account unavailable.');
 return response({ok:true},await createSession(row.id,request));
 }
 const user=await currentAccount();if(!user)throw new HttpError(401,'Sign in first.');
 if(action==='logout'){await db().prepare('DELETE FROM sessions WHERE user_id=?').bind(user.id).run();return response({ok:true},sessionCookie('',request))}
 if(action==='profile'){await db().prepare('UPDATE users SET name=? WHERE id=?').bind(textValue(b.name,80),user.id).run();return response({ok:true})}
 if(action==='password'){
 const row=await db().prepare('SELECT password FROM users WHERE id=?').bind(user.id).first<any>();
 if(!await throttle('password:'+user.id))throw new HttpError(429,'Try again in 15 minutes.');
 if(typeof b.current!=='string'||!await verifyPassword(b.current,row.password))throw new HttpError(400,'Current password is incorrect.');
 if(typeof b.password!=='string'||b.password.length<12||b.password.length>128)throw new HttpError(400,'Use 12–128 characters.');
 await db().prepare('UPDATE users SET password=? WHERE id=?').bind(await hashPassword(b.password),user.id).run();await db().prepare('DELETE FROM sessions WHERE user_id=?').bind(user.id).run();return response({ok:true},sessionCookie('',request));
 }
 throw new HttpError(400,'Unknown account action.');
 }catch(e){return fail(e)}}
