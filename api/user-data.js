import {getSql,ensureSchema} from "./_db.js";
import {getUserSession} from "./_user-auth.js";

const ALLOWED_SECTIONS=new Set(["chats","memory","settings","preferences"]);

function bodyOf(request){
  if(request.body&&typeof request.body==="object")return request.body;
  if(typeof request.body==="string"){try{return JSON.parse(request.body)}catch{return {}}}
  return {};
}

function getSection(request,body={}){
  const raw=request.query?.section||body.section||"";
  const section=String(raw).trim().toLowerCase();
  return ALLOWED_SECTIONS.has(section)?section:"";
}

export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  try{
    await ensureSchema();
    const session=getUserSession(request);
    if(!session){response.status(401).json({ok:false,error:"AUTHENTICATION_REQUIRED"});return;}

    const body=bodyOf(request);
    const section=getSection(request,body);
    if(!section){response.status(400).json({ok:false,error:"INVALID_DATA_SECTION"});return;}
    const sql=getSql();

    if(request.method==="GET"){
      const rows=await sql`
        SELECT data,updated_at FROM rigo_user_data
        WHERE user_id=${session.userId} AND section=${section}
        LIMIT 1
      `;
      response.status(200).json({ok:true,section,data:rows[0]?.data??null,updatedAt:rows[0]?.updated_at??null});
      return;
    }

    if(request.method==="PUT"||request.method==="POST"){
      const data=body.data;
      if(data===undefined){response.status(400).json({ok:false,error:"DATA_REQUIRED"});return;}
      const serialized=JSON.stringify(data);
      if(serialized.length>2_000_000){response.status(413).json({ok:false,error:"DATA_TOO_LARGE"});return;}
      const rows=await sql`
        INSERT INTO rigo_user_data(user_id,section,data,updated_at)
        VALUES(${session.userId},${section},${serialized}::jsonb,NOW())
        ON CONFLICT(user_id,section)
        DO UPDATE SET data=EXCLUDED.data,updated_at=NOW()
        RETURNING updated_at
      `;
      response.status(200).json({ok:true,section,updatedAt:rows[0]?.updated_at??null});
      return;
    }

    if(request.method==="DELETE"){
      await sql`DELETE FROM rigo_user_data WHERE user_id=${session.userId} AND section=${section}`;
      response.status(200).json({ok:true,section,deleted:true});
      return;
    }

    response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
  }catch(error){response.status(error?.status||500).json({ok:false,error:error?.message||String(error)});}
}
