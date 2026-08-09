import {getSql,ensureSchema} from "./_db.js";

export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");

  if(request.method!=="GET"){
    response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
    return;
  }

  try{
    await ensureSchema();
    const sql=getSql();
    const rows=await sql`SELECT NOW() AS now, current_database() AS database`;
    response.status(200).json({
      ok:true,
      connected:true,
      database:rows?.[0]?.database||null,
      serverTime:rows?.[0]?.now||null
    });
  }
  catch(error){
    response.status(error?.status||500).json({
      ok:false,
      connected:false,
      error:error?.message||"DATABASE_HEALTH_FAILED"
    });
  }
}
