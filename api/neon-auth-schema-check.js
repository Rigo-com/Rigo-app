import {getSql} from "./_db.js";

export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  try{
    const sql=getSql();

    const tables=await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='neon_auth'
      ORDER BY table_name
    `;

    const schema=await sql`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name='neon_auth'
      LIMIT 1
    `;

    const [users]=await sql`SELECT COUNT(*)::int AS count FROM neon_auth."user"`;
    const [sessions]=await sql`SELECT COUNT(*)::int AS count FROM neon_auth.session`;
    const [accounts]=await sql`SELECT COUNT(*)::int AS count FROM neon_auth.account`;
    const [configs]=await sql`SELECT COUNT(*)::int AS count FROM neon_auth.project_config`;
    const [jwks]=await sql`SELECT COUNT(*)::int AS count FROM neon_auth.jwks`;

    response.status(200).json({
      ok:true,
      schemaExists:Boolean(schema.length),
      tableCount:tables.length,
      tables:tables.map(row=>row.table_name),
      rowCounts:{
        user:users?.count||0,
        session:sessions?.count||0,
        account:accounts?.count||0,
        project_config:configs?.count||0,
        jwks:jwks?.count||0
      }
    });
  }catch(error){
    response.status(500).json({ok:false,error:error?.message||String(error)});
  }
}
