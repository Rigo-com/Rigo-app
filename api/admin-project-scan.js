import path from "node:path";
import { requireAdminSession } from "./_admin-auth.js";

const OWNER=process.env.RIGO_GITHUB_OWNER||"Rigo-com";
const REPO=process.env.RIGO_GITHUB_REPO||"Rigo-app";
const BRANCH=process.env.RIGO_ADMIN_BRANCH||"ai-bootstrap-wiring";
const ROOT=process.env.RIGO_ADMIN_ROOT||"js";
const MAX_FILES=Math.max(1,Number(process.env.RIGO_ADMIN_SCAN_MAX_FILES)||350);
const MAX_FILE_SIZE=Math.max(1024,Number(process.env.RIGO_ADMIN_SCAN_MAX_FILE_SIZE)||250000);

function headers(){const value={"Accept":"application/vnd.github+json","User-Agent":"RIGO-Admin-Agent","X-GitHub-Api-Version":"2022-11-28"};if(process.env.GITHUB_TOKEN)value.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;return value;}
async function githubJSON(url){const response=await fetch(url,{headers:headers()});const body=await response.json().catch(()=>null);if(!response.ok)throw new Error(body?.message||`GITHUB_REQUEST_FAILED:${response.status}`);return body;}
async function getTree(){
  const branch=await githubJSON(`https://api.github.com/repos/${OWNER}/${REPO}/branches/${encodeURIComponent(BRANCH)}`);
  const tree=await githubJSON(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${branch.commit.commit.tree.sha}?recursive=1`);
  if(tree.truncated)throw new Error("GITHUB_TREE_TRUNCATED");
  return tree.tree||[];
}
async function readBlob(sha){const blob=await githubJSON(`https://api.github.com/repos/${OWNER}/${REPO}/git/blobs/${sha}`);return blob.encoding==="base64"?Buffer.from(String(blob.content||"").replace(/\n/g,""),"base64").toString("utf8"):String(blob.content||"");}
function unique(values){return [...new Set(values.filter(Boolean))];}
function resolveImport(source,specifier,fileSet){
  if(!specifier.startsWith("."))return specifier;
  const base=path.posix.normalize(path.posix.join(path.posix.dirname(source),specifier));
  for(const candidate of [base,base+".js",path.posix.join(base,"index.js")])if(fileSet.has(candidate))return candidate;
  return base;
}
function analyzeSource(file,content,fileSet){
  const imports=unique([...content.matchAll(/(?:import\s+(?:[\s\S]*?\s+from\s+)?|export\s+[\s\S]*?\s+from\s+)["']([^"']+)["']/g)].map(match=>match[1]));
  const exports=unique([
    ...[...content.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)].map(match=>match[1]),
    ...[...content.matchAll(/export\s*\{([^}]+)\}/g)].flatMap(match=>match[1].split(",").map(value=>value.trim().split(/\s+as\s+/)[1]||value.trim().split(/\s+as\s+/)[0]))
  ]);
  return {path:file.path,imports,exports,relationships:imports.map(specifier=>({from:file.path,to:resolveImport(file.path,specifier,fileSet),type:"import"}))};
}
function classify(files){
  const systems=unique(files.map(file=>file.path.split("/")[1])).sort().map(id=>({id,path:`${ROOT}/${id}`,files:files.filter(file=>file.path.startsWith(`${ROOT}/${id}/`)).length}));
  const routes=files.filter(file=>/(?:^|\/)routes?(?:\/|\.)|router/i.test(file.path));
  const ui=files.filter(file=>/(?:^|\/)(?:ui|studio|pages?|components?)(?:\/|\.)/i.test(file.path));
  const agents=files.filter(file=>/agent/i.test(file.path));
  return {systems,routes,ui,agents,ai:files.filter(file=>/(?:^|\/)ai(?:\/|\.)/i.test(file.path)),memory:files.filter(file=>/(?:^|\/)memory(?:\/|\.)/i.test(file.path)),debug:files.filter(file=>/(?:^|\/)debug(?:\/|\.)/i.test(file.path))};
}
export function analyzeProject(files,sources={}){
  const fileSet=new Set(files.map(file=>file.path));
  const analyses=files.filter(file=>typeof sources[file.path]==="string").map(file=>analyzeSource(file,sources[file.path],fileSet));
  const imports=analyses.flatMap(item=>item.imports.map(specifier=>({file:item.path,specifier,resolved:resolveImport(item.path,specifier,fileSet)})));
  const exports=analyses.flatMap(item=>item.exports.map(name=>({file:item.path,name})));
  const relationships=analyses.flatMap(item=>item.relationships);
  const categories=classify(files);
  const nodes=files.map(file=>({id:file.path,type:"file",size:file.size||0}));
  const edges=relationships.map(item=>({source:item.from,target:item.to,type:item.type}));
  return {...categories,imports,exports,relationships,graph:{nodes,edges},diagnostics:{files:files.length,analyzedFiles:analyses.length,imports:imports.length,exports:exports.length,relationships:relationships.length}};
}
async function mapLimit(items,limit,worker){const results=new Array(items.length);let cursor=0;async function run(){while(cursor<items.length){const index=cursor++;results[index]=await worker(items[index],index);}}await Promise.all(Array.from({length:Math.min(limit,items.length)},run));return results;}
async function scan(){
  const tree=await getTree();
  const rootPrefix=ROOT.replace(/\/+$/,"")+"/";
  const fileEntries=tree.filter(entry=>entry.type==="blob"&&entry.path.startsWith(rootPrefix));
  const files=fileEntries.map(entry=>({name:path.posix.basename(entry.path),path:entry.path,size:entry.size||0,sha:entry.sha,url:`https://github.com/${OWNER}/${REPO}/blob/${BRANCH}/${entry.path}`}));
  const folders=tree.filter(entry=>entry.type==="tree"&&entry.path.startsWith(rootPrefix)).map(entry=>({name:path.posix.basename(entry.path),path:entry.path,url:`https://github.com/${OWNER}/${REPO}/tree/${BRANCH}/${entry.path}`}));
  const candidates=fileEntries.filter(entry=>/\.(?:js|mjs|json|html|css)$/.test(entry.path)&&entry.size<=MAX_FILE_SIZE).slice(0,MAX_FILES);
  const contents=await mapLimit(candidates,8,async entry=>{try{return await readBlob(entry.sha);}catch{return null;}});
  const sources={};candidates.forEach((entry,index)=>{if(contents[index]!==null)sources[entry.path]=contents[index];});
  return {files,folders,...analyzeProject(files,sources)};
}
export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  if(request.method!=="GET"){response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});return;}
  const admin=requireAdminSession(request,response);if(!admin)return;
  try{const raw=await scan();response.status(200).json({ok:true,source:"github-server",owner:OWNER,repo:REPO,branch:BRANCH,root:ROOT,raw});}
  catch(error){response.status(500).json({ok:false,error:error?.message||String(error)});}
}
