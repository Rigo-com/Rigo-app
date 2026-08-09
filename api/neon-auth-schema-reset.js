import {getSql} from "./_db.js";

export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  if(request.method!=="POST"){
    response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
    return;
  }

  try{
    const sql=getSql();

    const [users]=await sql`SELECT COUNT(*)::int AS count FROM neon_auth."user"`;
    const [sessions]=await sql`SELECT COUNT(*)::int AS count FROM neon_auth.session`;
    const [accounts]=await sql`SELECT COUNT(*)::int AS count FROM neon_auth.account`;
    const [configs]=await sql`SELECT COUNT(*)::int AS count FROM neon_auth.project_config`;
    const [jwks]=await sql`SELECT COUNT(*)::int AS count FROM neon_auth.jwks`;

    const counts=[users?.count||0,sessions?.count||0,accounts?.count||0,configs?.count||0,jwks?.count||0];
    if(counts.some(count=>count!==0)){
      response.status(409).json({ok:false,error:"NEON_AUTH_SCHEMA_NOT_EMPTY",counts});
      return;
    }

    await sql`DROP SCHEMA neon_auth CASCADE`;
    response.status(200).json({ok:true,dropped:true});
  }
  catch(error){
    response.status(500).json({ok:false,error:error?.message||String(error)});
  }
}
