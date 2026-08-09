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

function normalizeBaseUrl(value){
  return String(value||"").replace(/\/+$/,"");
}

function sanitizeSetCookie(value){
  if(!value)return value;
  return value
    .replace(/;\s*Domain=[^;]+/ig,"")
    .replace(/;\s*SameSite=None/ig,"; SameSite=Lax");
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

  if(!config){
    response.status(400).json({ok:false,error:"INVALID_AUTH_ACTION"});
    return;
  }

  if(request.method!==config.method){
    response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
    return;
  }

  try{
    const headers={
      "Accept":"application/json",
      "Content-Type":"application/json",
      "Origin":`https://${request.headers.host}`
    };

    if(request.headers.cookie){
      headers.Cookie=request.headers.cookie;
    }

    const init={method:config.method,headers,redirect:"manual"};
    if(config.method!=="GET"){
      const payload={...body};
      delete payload.action;
      init.body=JSON.stringify(payload);
    }

    const upstream=await fetch(`${baseUrl}/${config.path}`,init);
    const text=await upstream.text();

    const cookies=typeof upstream.headers.getSetCookie==="function"
      ? upstream.headers.getSetCookie()
      : [upstream.headers.get("set-cookie")].filter(Boolean);

    if(cookies.length){
      response.setHeader("Set-Cookie",cookies.map(sanitizeSetCookie));
    }

    const contentType=upstream.headers.get("content-type");
    if(contentType)response.setHeader("Content-Type",contentType);

    response.status(upstream.status).send(text||"");
  }
  catch(error){
    response.status(502).json({
      ok:false,
      error:error?.message||"NEON_AUTH_PROXY_FAILED"
    });
  }
}
