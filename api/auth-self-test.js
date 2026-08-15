import { neon } from "@neondatabase/serverless";

function db(){return neon(process.env.DATABASE_URL)}
function cookieFrom(response){const raw=response.headers.get("set-cookie")||"";return raw.split(";")[0]||""}
async function json(response){return response.json().catch(()=>({}))}

export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  if(request.method!=="GET")return response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});

  const origin=`https://${request.headers.host}`;
  const stamp=Date.now();
  const a={email:`rigo.selftest.a.${stamp}@example.com`,password:`Aa!${stamp}xYz12345`,name:"Self Test A"};
  const b={email:`rigo.selftest.b.${stamp}@example.com`,password:`Bb!${stamp}xYz12345`,name:"Self Test B"};
  const result={registerA:false,registerB:false,sessionA:false,sessionB:false,writeA:false,writeB:false,isolation:false,logoutA:false,logoutB:false,cleanup:false};

  try{
    const registerA=await fetch(`${origin}/api/neon-auth?action=register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...a,staySignedIn:true})});
    const registerAJson=await json(registerA);const cookieA=cookieFrom(registerA);
    result.registerA=registerA.ok&&Boolean(registerAJson?.user?.id)&&Boolean(cookieA);

    const registerB=await fetch(`${origin}/api/neon-auth?action=register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...b,staySignedIn:true})});
    const registerBJson=await json(registerB);const cookieB=cookieFrom(registerB);
    result.registerB=registerB.ok&&Boolean(registerBJson?.user?.id)&&Boolean(cookieB);

    const sessionA=await fetch(`${origin}/api/neon-auth?action=session`,{headers:{Cookie:cookieA}});const sessionAJson=await json(sessionA);
    const sessionB=await fetch(`${origin}/api/neon-auth?action=session`,{headers:{Cookie:cookieB}});const sessionBJson=await json(sessionB);
    result.sessionA=sessionA.ok&&sessionAJson?.user?.email===a.email;
    result.sessionB=sessionB.ok&&sessionBJson?.user?.email===b.email;

    const dataA={marker:`A-${stamp}`,messages:["private-a"]};
    const dataB={marker:`B-${stamp}`,messages:["private-b"]};
    const writeA=await fetch(`${origin}/api/user-data?section=chats`,{method:"PUT",headers:{"Content-Type":"application/json",Cookie:cookieA},body:JSON.stringify({data:dataA})});
    const writeB=await fetch(`${origin}/api/user-data?section=chats`,{method:"PUT",headers:{"Content-Type":"application/json",Cookie:cookieB},body:JSON.stringify({data:dataB})});
    result.writeA=writeA.ok;result.writeB=writeB.ok;

    const readA=await fetch(`${origin}/api/user-data?section=chats`,{headers:{Cookie:cookieA}});const readAJson=await json(readA);
    const readB=await fetch(`${origin}/api/user-data?section=chats`,{headers:{Cookie:cookieB}});const readBJson=await json(readB);
    result.isolation=readA.ok&&readB.ok&&readAJson?.data?.marker===dataA.marker&&readBJson?.data?.marker===dataB.marker&&readAJson?.data?.marker!==readBJson?.data?.marker;

    const logoutA=await fetch(`${origin}/api/neon-auth?action=logout`,{method:"POST",headers:{Cookie:cookieA,"Content-Type":"application/json"},body:"{}"});
    const logoutB=await fetch(`${origin}/api/neon-auth?action=logout`,{method:"POST",headers:{Cookie:cookieB,"Content-Type":"application/json"},body:"{}"});
    result.logoutA=logoutA.ok;result.logoutB=logoutB.ok;

    const sql=db();await sql`DELETE FROM rigo_users WHERE email IN (${a.email},${b.email})`;result.cleanup=true;
    const ok=Object.values(result).every(Boolean);
    return response.status(ok?200:500).json({ok,result});
  }catch(error){
    try{const sql=db();await sql`DELETE FROM rigo_users WHERE email IN (${a.email},${b.email})`;result.cleanup=true}catch{}
    return response.status(500).json({ok:false,result,error:error?.message||String(error)});
  }
}
