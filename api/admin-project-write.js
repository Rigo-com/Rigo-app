import { requireAdminSession } from "./_admin-auth.js";

const OWNER=process.env.RIGO_GITHUB_OWNER||"Rigo-com";
const REPO=process.env.RIGO_GITHUB_REPO||"Rigo-app";
const BRANCH=process.env.RIGO_ADMIN_BRANCH||"ai-bootstrap-wiring";
const ALLOWED_ROOT=process.env.RIGO_ADMIN_ROOT||"js";

function cleanPath(value){
  const path=String(value||"").replaceAll("\\","/").replace(/^\/+/, "").replace(/\/+/g,"/").trim();
  if(!path) throw new Error("FILE_PATH_REQUIRED");
  if(path.split("/").includes("..")) throw new Error("INVALID_FILE_PATH");
  if(path===ALLOWED_ROOT||!path.startsWith(ALLOWED_ROOT+"/")) throw new Error(`PATH_OUTSIDE_ALLOWED_ROOT:${ALLOWED_ROOT}`);
  return path;
}
function url(path){return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${cleanPath(path).split("/").map(encodeURIComponent).join("/")}`;}
function headers(){
  const token=process.env.GITHUB_TOKEN;
  if(!token) throw new Error("GITHUB_TOKEN_NOT_CONFIGURED");
  return {"Accept":"application/vnd.github+json","Authorization":`Bearer ${token}`,"User-Agent":"RIGO-Admin-Agent","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"};
}
async function github(path,{method="GET",body}={}){
  const response=await fetch(url(path),{method,headers:headers(),body:body?JSON.stringify(body):undefined});
  const raw=await response.text(); let result=null;
  try{result=raw?JSON.parse(raw):null;}catch{result={message:raw};}
  if(!response.ok){const error=new Error(result?.message||`GITHUB_REQUEST_FAILED:${response.status}`);error.status=response.status;error.details=result;throw error;}
  return result;
}
const fileBody=(content,message,extra={})=>({message,content:Buffer.from(String(content??""),"utf8").toString("base64"),branch:BRANCH,...extra});
async function createFile(o){const path=cleanPath(o.path);try{await github(path);throw new Error("FILE_ALREADY_EXISTS");}catch(e){if(e.status!==404)throw e;}const r=await github(path,{method:"PUT",body:fileBody(o.content,o.message||`RIGO Admin: create ${path}`)});return{ok:true,action:"create-file",path,branch:BRANCH,commit:r?.commit||null,file:r?.content||null};}
async function updateFile(o){const path=cleanPath(o.path),current=await github(path);if(current?.type!=="file"||!current.sha)throw new Error("FILE_NOT_FOUND_OR_INVALID");const r=await github(path,{method:"PUT",body:fileBody(o.content,o.message||`RIGO Admin: update ${path}`,{sha:current.sha})});return{ok:true,action:"update-file",path,branch:BRANCH,previousSha:current.sha,commit:r?.commit||null,file:r?.content||null};}
async function deleteFile(o){const path=cleanPath(o.path),current=await github(path);if(current?.type!=="file"||!current.sha)throw new Error("FILE_NOT_FOUND_OR_INVALID");const r=await github(path,{method:"DELETE",body:{message:o.message||`RIGO Admin: delete ${path}`,sha:current.sha,branch:BRANCH}});return{ok:true,action:"delete-file",path,branch:BRANCH,deletedSha:current.sha,commit:r?.commit||null};}
async function moveFile(o){
  const sourcePath=cleanPath(o.sourcePath),destinationPath=cleanPath(o.destinationPath);if(sourcePath===destinationPath)throw new Error("SOURCE_AND_DESTINATION_ARE_EQUAL");
  const source=await github(sourcePath);if(source?.type!=="file"||!source.sha||!source.content)throw new Error("SOURCE_FILE_NOT_FOUND_OR_INVALID");
  try{await github(destinationPath);throw new Error("DESTINATION_FILE_ALREADY_EXISTS");}catch(e){if(e.status!==404)throw e;}
  const message=o.message||`RIGO Admin: move ${sourcePath} to ${destinationPath}`;
  const created=await github(destinationPath,{method:"PUT",body:{message,content:String(source.content).replace(/\n/g,""),branch:BRANCH}});
  try{const removed=await github(sourcePath,{method:"DELETE",body:{message,sha:source.sha,branch:BRANCH}});return{ok:true,action:"move-file",sourcePath,destinationPath,branch:BRANCH,createCommit:created?.commit||null,deleteCommit:removed?.commit||null};}
  catch(error){
    try{const target=await github(destinationPath);if(target?.sha)await github(destinationPath,{method:"DELETE",body:{message:`RIGO Admin rollback: ${destinationPath}`,sha:target.sha,branch:BRANCH}});}catch{}
    throw error;
  }
}
async function execute(body){switch(String(body.action||"").trim().toLowerCase()){case"create-file":return createFile(body);case"update-file":return updateFile(body);case"delete-file":return deleteFile(body);case"move-file":return moveFile(body);default:throw new Error(`UNSUPPORTED_ADMIN_ACTION:${body.action||"EMPTY"}`);}}
export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  if(request.method!=="POST"){response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});return;}
  const admin=requireAdminSession(request,response);if(!admin)return;
  try{const result=await execute(request.body||{});response.status(200).json(result);}
  catch(error){response.status(error?.status||500).json({ok:false,error:error?.message||String(error),details:error?.details||null,branch:BRANCH});}
}
