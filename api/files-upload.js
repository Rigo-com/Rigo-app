import { put } from "@vercel/blob";
import { requireAdminSession } from "./_admin-auth.js";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf", "application/json", "application/zip",
  "text/plain", "text/csv", "text/markdown",
  "application/javascript", "text/javascript", "text/css", "text/html"
]);

function safeName(value){
  const cleaned=String(value||"file").normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"");
  return cleaned.replace(/^\.+/,"").slice(0,120)||"file";
}

async function readBody(request){
  if(Buffer.isBuffer(request.body)) return request.body;
  if(typeof request.body==="string") return Buffer.from(request.body);
  const chunks=[];let size=0;
  for await(const chunk of request){size+=chunk.length;if(size>MAX_FILE_SIZE+64*1024)throw Object.assign(new Error("FILE_TOO_LARGE"),{status:413});chunks.push(chunk);}
  return Buffer.concat(chunks);
}

function parseMultipart(buffer,contentType){
  const boundaryMatch=String(contentType||"").match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if(!boundaryMatch)throw Object.assign(new Error("MULTIPART_BOUNDARY_REQUIRED"),{status:400});
  const boundary=Buffer.from(`--${boundaryMatch[1]||boundaryMatch[2]}`);
  let cursor=buffer.indexOf(boundary);
  while(cursor>=0){
    const headerStart=cursor+boundary.length+2;
    const headerEnd=buffer.indexOf(Buffer.from("\r\n\r\n"),headerStart);
    if(headerEnd<0)break;
    const headers=buffer.subarray(headerStart,headerEnd).toString("utf8");
    const filename=headers.match(/filename="([^"]*)"/i)?.[1];
    if(filename!==undefined){
      const nextBoundary=buffer.indexOf(boundary,headerEnd+4);
      if(nextBoundary<0)break;
      const type=headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim()||"application/octet-stream";
      return {name:filename,type,data:buffer.subarray(headerEnd+4,nextBoundary-2)};
    }
    cursor=buffer.indexOf(boundary,headerEnd+4);
  }
  throw Object.assign(new Error("FILE_PART_REQUIRED"),{status:400});
}

export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  if(request.method!=="POST"){response.setHeader("Allow","POST");response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});return;}
  const admin=requireAdminSession(request,response);if(!admin)return;
  try{
    const file=parseMultipart(await readBody(request),request.headers?.["content-type"]);
    if(!file.data.length)throw Object.assign(new Error("EMPTY_FILE"),{status:400});
    if(file.data.length>MAX_FILE_SIZE)throw Object.assign(new Error("FILE_TOO_LARGE"),{status:413});
    if(!ALLOWED_TYPES.has(file.type))throw Object.assign(new Error("FILE_TYPE_NOT_ALLOWED"),{status:415});
    const blob=await put(`rigo/${Date.now()}-${safeName(file.name)}`,file.data,{access:"private",addRandomSuffix:true,contentType:file.type});
    response.status(201).json({ok:true,file:{url:blob.url,downloadUrl:blob.downloadUrl||null,pathname:blob.pathname,contentType:blob.contentType||file.type,size:file.data.length,name:file.name,uploadedAt:Date.now()}});
  }catch(error){response.status(error?.status||500).json({ok:false,error:error?.message||"UPLOAD_FAILED"});}
}

export { MAX_FILE_SIZE, ALLOWED_TYPES, safeName, parseMultipart };
