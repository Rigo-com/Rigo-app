import {authenticateAdmin,issueAdminSession,clearAdminSession,getAdminSession,adminAuthConfigured} from "./_admin-auth.js";

function bodyOf(request){
  if(request.body&&typeof request.body==="object")return request.body;
  if(typeof request.body==="string"){try{return JSON.parse(request.body)}catch{return {}}}
  return {};
}

export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");

  if(request.method==="GET"){
    const session=getAdminSession(request);
    if(!session){response.status(200).json({ok:true,authenticated:false,admin:false,configured:adminAuthConfigured()});return;}
    if(session.persistent)issueAdminSession(response,{email:session.email,persistent:true});
    response.status(200).json({ok:true,authenticated:true,admin:true,email:session.email,persistent:Boolean(session.persistent)});
    return;
  }

  if(request.method==="POST"){
    const body=bodyOf(request);
    const result=authenticateAdmin(body.email,body.password);
    if(!result.ok){response.status(result.error==="ADMIN_AUTH_NOT_CONFIGURED"?503:403).json(result);return;}
    issueAdminSession(response,{email:result.email,persistent:Boolean(body.staySignedIn)});
    response.status(200).json({ok:true,authenticated:true,admin:true,email:result.email,persistent:Boolean(body.staySignedIn)});
    return;
  }

  if(request.method==="DELETE"){
    clearAdminSession(response);
    response.status(200).json({ok:true,authenticated:false,admin:false});
    return;
  }

  response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
}
