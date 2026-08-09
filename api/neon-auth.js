import {authenticateAdmin,isAdminEmail,issueAdminSession,clearAdminSession} from "./_admin-auth.js";

const ACTIONS=Object.freeze({
  session:{method:"GET",path:"get-session"},
  login:{method:"POST",path:"sign-in/email"},
  register:{method:"POST",path:"sign-up/email"},
  logout:{method:"POST",path:"sign-out"}
});

function bodyOf(request){
  if(request.body&&typeof request.body==="object")return request.body;
  if(typeof request.body==="string"){
    try{return JSON.parse(request.body)}catch{return {}}
  }
  return {};
}

function normalizeBaseUrl(value){return String(value||"").replace(/\/+$/,"");}
function normalizeEmail(value){return String(value||"").trim().toLowerCase();}

function sanitizeSetCookie(value,persistent=true){
  if(!value)return value;
  let result=value
    .replace(/;\s*Domain=[^;]+/ig,"")
    .replace(/;\s*SameSite=None/ig,"; SameSite=Lax");

  if(!persistent){
    result=result
      .replace(/;\s*Max-Age=[^;]+/ig,"")
      .replace(/;\s*Expires=[^;]+/ig,"");
  }

  return result;
}

function upstreamCookies(upstream,persistent){
  const values=typeof upstream.headers.getSetCookie==="function"
    ? upstream.headers.getSetCookie()
    : [upstream.headers.get("set-cookie")].filter(Boolean);
  return values.map(value=>sanitizeSetCookie(value,persistent));
}

async function forwardAuth({baseUrl,path,request,payload=null,persistent=true}){
  const headers={
    Accept:"application/json",
    "Content-Type":"application/json",
    Origin:`https://${request.headers.host}`
  };

  if(request.headers.cookie){headers.Cookie=request.headers.cookie;}

  const init={
    method:payload===null?"GET":"POST",
    headers,
    redirect:"manual"
  };

  if(payload!==null){init.body=JSON.stringify(payload);}

  const upstream=await fetch(`${baseUrl}/${path}`,init);
  const text=await upstream.text();
  return {
    upstream,
    text,
    cookies:upstreamCookies(upstream,persistent)
  };
}

function parseJson(text){
  try{return text?JSON.parse(text):null}catch{return null}
}

function applyCookies(response,cookies=[]){
  if(cookies.length){response.setHeader("Set-Cookie",cookies);}
}

export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");

  const baseUrl=normalizeBaseUrl(process.env.NEON_AUTH_BASE_URL);
  if(!baseUrl){
    response.status(503).json({ok:false,error:"NEON_AUTH_NOT_CONFIGURED"});
    return;
  }

  const body=bodyOf(request);
  const action=String(request.query?.action||body.action||"");
  const config=ACTIONS[action];

  if(!config){response.status(400).json({ok:false,error:"INVALID_AUTH_ACTION"});return;}
  if(request.method!==config.method){response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});return;}

  const persistent=Boolean(body.staySignedIn);
  const email=normalizeEmail(body.email);

  try{
    if(action==="register"&&isAdminEmail(email)){
      response.status(403).json({ok:false,error:"ADMIN_ACCOUNT_CANNOT_BE_REGISTERED"});
      return;
    }

    if(action==="login"&&isAdminEmail(email)){
      const admin=authenticateAdmin(email,body.password);
      if(!admin.ok){response.status(403).json(admin);return;}
    }

    if(action==="logout"){
      const result=await forwardAuth({baseUrl,path:config.path,request,payload:{},persistent:false});
      const cookies=[...result.cookies];
      clearAdminSession({setHeader(name,value){if(name==="Set-Cookie")cookies.push(value);}});
      applyCookies(response,cookies);
      response.status(result.upstream.ok?200:result.upstream.status).send(result.text||JSON.stringify({ok:true}));
      return;
    }

    if(action==="session"){
      const result=await forwardAuth({baseUrl,path:config.path,request,payload:null,persistent:true});
      applyCookies(response,result.cookies);
      response.status(result.upstream.status).send(result.text||"");
      return;
    }

    const payload={...body};
    delete payload.action;
    delete payload.staySignedIn;
    payload.email=email;

    if(action==="login"&&"rememberMe" in payload===false){
      payload.rememberMe=persistent;
    }

    let result=await forwardAuth({baseUrl,path:config.path,request,payload,persistent});

    if(action==="login"&&isAdminEmail(email)&&!result.upstream.ok){
      const signUpPayload={
        email,
        password:body.password,
        name:"RIGO Admin"
      };
      const bootstrap=await forwardAuth({baseUrl,path:ACTIONS.register.path,request,payload:signUpPayload,persistent});
      if(bootstrap.upstream.ok){
        result=bootstrap;
      }
    }

    const cookies=[...result.cookies];

    if(action==="login"&&isAdminEmail(email)&&result.upstream.ok){
      const holder={setHeader(name,value){if(name==="Set-Cookie")cookies.push(value);}};
      issueAdminSession(holder,{email,persistent});
    }

    applyCookies(response,cookies);

    const contentType=result.upstream.headers.get("content-type");
    if(contentType)response.setHeader("Content-Type",contentType);

    const parsed=parseJson(result.text);
    if(result.upstream.ok&&parsed&&typeof parsed==="object"){
      response.status(result.upstream.status).json({...parsed,role:isAdminEmail(email)?"admin":"user"});
      return;
    }

    response.status(result.upstream.status).send(result.text||"");
  }
  catch(error){
    response.status(502).json({ok:false,error:error?.message||"NEON_AUTH_PROXY_FAILED"});
  }
}
