import {db,fail,owner,ownedProject} from '@/lib/server';
import {deleteProjectStatements} from '@/lib/delete-project';
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await owner(request),{id}=await params;
 await ownedProject(id,user);
 await db().batch(deleteProjectStatements.map(sql=>db().prepare(sql).bind(id,user)));
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
}catch(e){return fail(e)}}
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{const user=await owner(),{id}=await params;await ownedProject(id,user);const [audits,tasks]=await Promise.all([db().prepare('SELECT result FROM audits WHERE project_id = ? AND owner = ? ORDER BY created_at DESC LIMIT 30').bind(id,user).all<{result:string}>(),db().prepare('SELECT id,title,priority,url,status FROM tasks WHERE project_id = ? AND owner = ? ORDER BY created_at DESC').bind(id,user).all()]);return Response.json({audits:audits.results.map(x=>JSON.parse(x.result)),tasks:tasks.results},{headers:{'Cache-Control':'private, no-store'}})}catch(e){return fail(e)}}
