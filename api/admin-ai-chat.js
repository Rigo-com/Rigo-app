import {requireAdminSession} from "./_admin-auth.js";

const OPENROUTER_URL="https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL=process.env.OPENROUTER_MODEL||"openrouter/free";
const MAX_MESSAGE_LENGTH=20000;
const SYSTEM_PROMPT=`You are RIGO Admin Agent. You are the private administrative AI assistant for the RIGO project. You may analyze architecture, code, debugging, implementation plans and project changes. Never claim execution unless it actually happened. Project-changing operations require explicit admin approval. Preserve the RIGO architecture and Container-first rules.`;

function normalizeText(value){return String(value||"").trim()}
function normalizeMessages(value){if(!Array.isArray(value))return[];return value.filter(m=>m&&typeof m==="object"&&["system","user","assistant"].includes(m.role)&&typeof m.content==="string"&&m.content.trim()).map(m=>({role:m.role,content:m.content.trim().slice(0,MAX_MESSAGE_LENGTH)}))}
function bodyOf(request){if(request.body&&typeof request.body==="object")return request.body;if(typeof request.body==="string"){try{return JSON.parse(request.body)}catch{return {}}}return {}}
function buildMessages(body){const list=[{role:"system",content:SYSTEM_PROMPT}],context=normalizeText(body.context),message=normalizeText(body.message||body.input||body.prompt);if(context)list.push({role:"system",content:`Project context supplied by RIGO:\n${context}`});list.push(...normalizeMessages(body.messages));if(message)list.push({role:"user",content:message.slice(0,MAX_MESSAGE_LENGTH)});return list}
function headers(request){const apiKey=process.env.OPENROUTER_API_KEY;if(!apiKey)throw new Error("OPENROUTER_API_KEY_NOT_CONFIGURED");return{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json","HTTP-Referer":normalizeText(request.headers?.origin)||process.env.RIGO_SITE_URL||"https://rigo-app.vercel.app","X-OpenRouter-Title":"RIGO Admin Agent"}}

export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  if(request.method!=="POST"){response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});return}
  const admin=requireAdminSession(request,response);if(!admin)return;
  try{
    const body=bodyOf(request),messages=buildMessages(body);if(messages.length<=1)throw new Error("ADMIN_AI_MESSAGE_REQUIRED");
    const model=normalizeText(body.model)||DEFAULT_MODEL;
    const upstream=await fetch(OPENROUTER_URL,{method:"POST",headers:headers(request),body:JSON.stringify({model,messages,temperature:Number.isFinite(body.temperature)?body.temperature:0.2,max_tokens:Number.isFinite(body.maxTokens)?body.maxTokens:2000})});
    const raw=await upstream.text();let result;try{result=raw?JSON.parse(raw):null}catch{result={raw}}
    if(!upstream.ok){response.status(upstream.status).json({ok:false,error:result?.error?.message||result?.message||`OPENROUTER_REQUEST_FAILED:${upstream.status}`,details:result});return}
    const message=result?.choices?.[0]?.message?.content;if(typeof message!=="string"||!message.trim())throw new Error("OPENROUTER_EMPTY_RESPONSE");
    response.status(200).json({ok:true,mode:"admin-ai-chat",message:message.trim(),model:result?.model||model,usage:result?.usage||null,requestId:result?.id||null,admin:admin.email,createdAt:Date.now()});
  }catch(error){response.status(500).json({ok:false,error:error?.message||String(error),timestamp:Date.now()})}
}
