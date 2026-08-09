export default function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  const keys=Object.keys(process.env)
    .filter(key=>/(NEON|DATABASE|AUTH)/i.test(key))
    .sort();
  response.status(200).json({ok:true,keys});
}
