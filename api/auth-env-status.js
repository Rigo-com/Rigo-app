export default function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  response.status(200).json({
    ok:true,
    neonAuthBaseUrl:process.env.NEON_AUTH_BASE_URL||null,
    databaseNeonAuthBaseUrl:process.env.DATABASE_NEON_AUTH_BASE_URL||null,
    databaseViteNeonAuthUrl:process.env.DATABASE_VITE_NEON_AUTH_URL||null
  });
}
