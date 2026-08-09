function normalizeBaseUrl(value){return String(value||"").replace(/\/+$/,"");}

function extractSession(payload){
  if(!payload)return null;

  if(payload.user){
    return {
      user:payload.user,
      session:payload.session||null
    };
  }

  if(payload.data?.user){
    return {
      user:payload.data.user,
      session:payload.data.session||null
    };
  }

  if(payload.data?.session?.user){
    return {
      user:payload.data.session.user,
      session:payload.data.session.session||payload.data.session
    };
  }

  return null;
}

async function getNeonSession(request){
  const baseUrl=normalizeBaseUrl(process.env.NEON_AUTH_BASE_URL);
  if(!baseUrl)return null;

  const headers={
    Accept:"application/json",
    Origin:`https://${request.headers.host}`
  };

  if(request.headers.cookie){headers.Cookie=request.headers.cookie;}

  const response=await fetch(`${baseUrl}/get-session`,{
    method:"GET",
    headers,
    redirect:"manual"
  });

  if(!response.ok)return null;

  const payload=await response.json().catch(()=>null);
  const normalized=extractSession(payload);
  if(!normalized?.user?.id)return null;

  return normalized;
}

export {getNeonSession,extractSession};
