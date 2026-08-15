import { neon } from "@neondatabase/serverless";
function db(){return neon(process.env.DATABASE_URL)}
function cookieFrom(r){return (r.headers.get("set-cookie")||"").split(";")[0]||""}
async function json(r){return r.json().catch(()=>({}))}
export default async function handler(request,response){
 response.setHeader("Cache-Control","no-store");if(request.method!=="GET")return response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
 const origin=`https://${request.headers.host}`,stamp=Date.now();
 const a={email:`rigo.selftest.a.${stamp}@example.com`,password:`Aa!${stamp}xYz12345`,name:"Self Test A"};
 const b={email:`rigo.selftest.b.${stamp}@example.com`,password:`Bb!${stamp}xYz12345`,name:"Self Test B"};
 const result={registerA:false,registerB:false,sessionA:false,sessionB:false,writeA:false,writeB:false,isolation:false,logoutA:false,logoutB:false,cleanup:false,details:{}};
 try{
  const ra=await fetch(`${origin}/api/neon-auth?action=register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...a,staySignedIn:true})});const ja=await json(ra);const ca=cookieFrom(ra);result.details.registerA={status:ra.status,body:ja};result.registerA=ra.ok&&!!ja?.user?.id&&!!ca;
  const rb=await fetch(`${origin}/api/neon-auth?action=register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...b,staySignedIn:true})});const jb=await json(rb);const cb=cookieFrom(rb);result.details.registerB={status:rb.status,body:jb};result.registerB=rb.ok&&!!jb?.user?.id&&!!cb;
  const sa=await fetch(`${origin}/api/neon-auth?action=session`,{headers:{Cookie:ca}});const jsa=await json(sa);const sb=await fetch(`${origin}/api/neon-auth?action=session`,{headers:{Cookie:cb}});const jsb=await json(sb);result.sessionA=sa.ok&&jsa?.user?.email===a.email;result.sessionB=sb.ok&&jsb?.user?.email===b.email;
  const da={marker:`A-${stamp}`},dbb={marker:`B-${stamp}`};const wa=await fetch(`${origin}/api/user-data?section=chats`,{method:"PUT",headers:{"Content-Type":"application/json",Cookie:ca},body:JSON.stringify({data:da})});const wb=await fetch(`${origin}/api/user-data?section=chats`,{method:"PUT",headers:{"Content-Type":"application/json",Cookie:cb},body:JSON.stringify({data:dbb})});result.writeA=wa.ok;result.writeB=wb.ok;
  const rda=await fetch(`${origin}/api/user-data?section=chats`,{headers:{Cookie:ca}});const jda=await json(rda);const rdb=await fetch(`${origin}/api/user-data?section=chats`,{headers:{Cookie:cb}});const jdb=await json(rdb);result.isolation=rda.ok&&rdb.ok&&jda?.data?.marker===da.marker&&jdb?.data?.marker===dbb.marker;
  result.logoutA=(await fetch(`${origin}/api/neon-auth?action=logout`,{method:"POST",headers:{Cookie:ca,"Content-Type":"application/json"},body:"{}"})).ok;result.logoutB=(await fetch(`${origin}/api/neon-auth?action=logout`,{method:"POST",headers:{Cookie:cb,"Content-Type":"application/json"},body:"{}"})).ok;
  const sql=db();await sql`DELETE FROM rigo_users WHERE email IN (${a.email},${b.email})`;result.cleanup=true;const ok=[result.registerA,result.registerB,result.sessionA,result.sessionB,result.writeA,result.writeB,result.isolation,result.logoutA,result.logoutB,result.cleanup].every(Boolean);return response.status(ok?200:500).json({ok,result});
 }catch(error){try{const sql=db();await sql`DELETE FROM rigo_users WHERE email IN (${a.email},${b.email})`;result.cleanup=true}catch{}return response.status(500).json({ok:false,result,error:error?.message||String(error)})}
}
