import { requireAdminSession } from "./_admin-auth.js";

const OWNER=process.env.RIGO_GITHUB_OWNER||"Rigo-com";
const REPO=process.env.RIGO_GITHUB_REPO||"Rigo-app";
const BRANCH=process.env.RIGO_ADMIN_BRANCH||"ai-bootstrap-wiring";
const ROOT=process.env.RIGO_ADMIN_ROOT||"js";
const MAX_SIZE=Math.max(1024,Number(process.env.RIGO_ADMIN_READ_MAX_SIZE)||500000);

function clean(value){
  const file=String(value||"").replaceAll("\\","/").replace(/^\/+/, "").replace(/\/+/g,"/").trim();
  if(!file||file.split("/").includes("..")||!file.startsWith(ROOT+"/"))throw new Error("INVALID_PROJECT_FILE_PATH");
  return file;
}
function headers(){const value={"Accept":"application/vnd.github+json","User-Agent":"RIGO-Admin-Agent","X-GitHub-Api-Version":"2022-11-28"};if(process.env.GITHUB_TOKEN)value.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;return value;}
export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  if(request.method!=="GET"){response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});return;}
  const admin=requireAdminSession(request,response);if(!admin)return;
  try{
    const file=clean(request.query?.path);
    const url=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${file.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(BRANCH)}`;
    const upstream=await fetch(url,{headers:headers()});const body=await upstream.json().catch(()=>null);
    if(!upstream.ok)throw Object.assign(new Error(body?.message||`GITHUB_REQUEST_FAILED:${upstream.status}`),{status:upstream.status});
    if(body?.type!=="file"||!body.content)throw new Error("PROJECT_FILE_NOT_FOUND");
    if(Number(body.size)>MAX_SIZE)throw Object.assign(new Error("PROJECT_FILE_TOO_LARGE"),{status:413});
    const content=body.encoding==="base64"?Buffer.from(String(body.content).replace(/\n/g,""),"base64").toString("utf8"):String(body.content);
    response.status(200).json({ok:true,path:file,branch:BRANCH,sha:body.sha,size:body.size||Buffer.byteLength(content),content});
  }catch(error){response.status(error?.status||500).json({ok:false,error:error?.message||String(error)});}
}
