import {body,db,fail,HttpError,sameOrigin,textValue} from '@/lib/server';
import {initAccounts,digest,randomToken,throttle,hashPassword,sessionCookie} from '@/lib/accounts';

export async function POST(request:Request){try{
 if(!sameOrigin(request))throw new HttpError(403,'Invalid request origin.');
 await initAccounts();
 const b=await body(request);
 if(b.action==='request'){
  const email=textValue(b.email,254).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HttpError(400,'Enter a valid email address.');
  if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)throw new HttpError(503,'Email recovery is not configured.');
  const message='If an active account matches that email, a reset link will arrive shortly. Check your spam folder too.';
  if(!await throttle(await digest('reset:'+email)))return Response.json({message});
  const row=await db().prepare("SELECT id,password FROM users WHERE email=? AND status='active'").bind(email).first<any>();
  if(row){
   const token=randomToken(),hash=await digest(token);
   await db().prepare('DELETE FROM password_resets WHERE expires_at<?').bind(Date.now()).run();
   await db().prepare('INSERT INTO password_resets (token,user_id,password_version,expires_at) VALUES (?,?,?,?)').bind(hash,row.id,row.password,Date.now()+1800000).run();
   const link=new URL('/reset-password',process.env.PUBLIC_APP_URL||'https://gp.deployandtest.com');link.hash=token;
   try{
    const r=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.EMAIL_FROM,to:email,subject:'Reset your GrowthPilot password',text:'Open this link to set a new password:\n\n'+link.toString()+'\n\nThis link expires in 30 minutes and can be used once. If you did not request this, ignore this email. Your password has not changed.'})});
    if(!r.ok){await db().prepare('DELETE FROM password_resets WHERE token=?').bind(hash).run();console.error('Password reset email delivery failed',r.status)}
   }catch{await db().prepare('DELETE FROM password_resets WHERE token=?').bind(hash).run();console.error('Password reset email delivery unavailable')}
  }
  return Response.json({message},{headers:{'Cache-Control':'no-store'}});
 }
 if(b.action==='reset'){
  if(typeof b.token!=='string'||!/^[a-f0-9]{64}$/.test(b.token))throw new HttpError(400,'Invalid reset link. Request a new one.');
  if(typeof b.password!=='string'||b.password.length<12||b.password.length>128)throw new HttpError(400,'Use 12–128 characters.');
  const hash=await digest(b.token);
  const row=await db().prepare('SELECT * FROM password_resets WHERE token=? AND expires_at>?').bind(hash,Date.now()).first<any>();
  if(!row)throw new HttpError(400,'This reset link has expired or was already used. Request a new one.');
  const password=await hashPassword(b.password);
  const result=await db().prepare("UPDATE users SET password=?,recovery=? WHERE id=? AND password=? AND status='active' AND EXISTS (SELECT 1 FROM password_resets WHERE token=? AND expires_at>?)").bind(password,await digest(randomToken()),row.user_id,row.password_version,hash,Date.now()).run();
  if(!result.meta.changes)throw new HttpError(400,'This reset link is no longer valid. Request a new one.');
  await db().prepare('DELETE FROM sessions WHERE user_id=?').bind(row.user_id).run();
  await db().prepare('DELETE FROM password_resets WHERE user_id=?').bind(row.user_id).run();
  return Response.json({message:'Password updated. Sign in with your new password.'},{headers:{'Cache-Control':'no-store','Set-Cookie':sessionCookie('',request)}});
 }
 throw new HttpError(400,'Unknown reset action.');
 }catch(e){return fail(e)}}
