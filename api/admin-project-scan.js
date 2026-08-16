import { requireAdminSession } from "./_admin-auth.js";

const OWNER=process.env.RIGO_GITHUB_OWNER||"Rigo-com";
const REPO=process.env.RIGO_GITHUB_REPO||"Rigo-app";
const BRANCH=process.env.RIGO_ADMIN_BRANCH||"ai-bootstrap-wiring";
const ROOT=process.env.RIGO_ADMIN_ROOT||"js";

function apiURL(path=""){
  const encoded=String(path).replace(/^\/+/, "").split("/").filter(Boolean).map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encoded}?ref=${encodeURIComponent(BRANCH)}`;
}
async function github(path){
  const headers={"Accept":"application/vnd.github+json","User-Agent":"RIGO-Admin-Agent","X-GitHub-Api-Version":"2022-11-28"};
  if(process.env.GITHUB_TOKEN) headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
  const response=await fetch(apiURL(path),{headers});
  const body=await response.json().catch(()=>null);
  if(!response.ok) throw new Error(body?.message||`GITHUB_REQUEST_FAILED:${response.status}:${path}`);
  return body;
}
async function walk(path,output){
  const entries=await github(path);
  if(!Array.isArray(entries)) return output;
  for(const entry of entries){
    if(entry.type==="dir"){
      output.folders.push({name:entry.name,path:entry.path,url:entry.html_url});
      await walk(entry.path,output);
    }else if(entry.type==="file"){
      output.files.push({name:entry.name,path:entry.path,url:entry.html_url,size:entry.size||0,sha:entry.sha||null});
    }
  }
  return output;
}
export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  if(request.method!=="GET"){response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});return;}
  const admin=requireAdminSession(request,response); if(!admin) return;
  try{
    const raw=await walk(ROOT,{files:[],folders:[],imports:[],exports:[],systems:[],relationships:[],graph:{nodes:[],edges:[]}});
    response.status(200).json({ok:true,source:"github-server",owner:OWNER,repo:REPO,branch:BRANCH,root:ROOT,raw});
  }catch(error){response.status(500).json({ok:false,error:error?.message||String(error)});}
}
