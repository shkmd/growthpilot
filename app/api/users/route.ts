import {currentAccount} from '@/lib/accounts';
import {db,body,fail,HttpError,sameOrigin} from '@/lib/server';
async function admin(){const u=await currentAccount();if(!u||u.role!=='admin')throw new HttpError(403,'Administrator access required.');return u}
export async function GET(){try{await admin();const users=await db().prepare('SELECT id,email,name,role,status,created_at FROM users ORDER BY created_at DESC LIMIT 500').all();return Response.json({users:users.results},{headers:{'Cache-Control':'no-store'}})}catch(e){return fail(e)}}
export async function PATCH(request:Request){try{
 if(!sameOrigin(request))throw new HttpError(403,'Invalid origin.');
 const u=await admin(),b=await body(request);if(b.id===u.id)throw new HttpError(400,'You cannot change your own administrator access.');
 if(!['admin','member'].includes(b.role)||!['active','disabled'].includes(b.status))throw new HttpError(400,'Invalid role or status.');
 const result=await db().prepare('UPDATE users SET role=?,status=? WHERE id=?').bind(b.role,b.status,b.id).run();if(!result.meta.changes)throw new HttpError(404,'User not found.');
 await db().prepare('DELETE FROM sessions WHERE user_id=?').bind(b.id).run();return Response.json({ok:true});
 }catch(e){return fail(e)}}
