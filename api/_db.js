import { neon } from "@neondatabase/serverless";

let schemaReady=false;

function getSql(){
  const url=process.env.DATABASE_URL;
  if(!url){
    const error=new Error("DATABASE_NOT_CONFIGURED");
    error.status=503;
    throw error;
  }
  return neon(url);
}

async function ensureSchema(){
  if(schemaReady)return true;
  const sql=getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS rigo_users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rigo_user_data (
      user_id UUID NOT NULL REFERENCES rigo_users(id) ON DELETE CASCADE,
      section TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, section)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS rigo_user_data_user_id_idx ON rigo_user_data(user_id)`;
  schemaReady=true;
  return true;
}

export {getSql,ensureSchema};
