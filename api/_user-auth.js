import crypto from "node:crypto";

const COOKIE="rigo_user_session";
const SESSION_MS=1000*60*60*24*30;

function secret(){
  return process.env.RIGO_USER_SESSION_SECRET||process.env.RIGO_ADMIN_SESSION_SECRET||process.env.OPENROUTER_API_KEY||"";
}

function configured(){return Boolean(secret());}

function hashPassword(password,salt=crypto.randomBytes(16).toString("hex")){
  const hash=crypto.scryptSync(String(password),salt,64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password,stored){
  try{
    const [salt,hex]=String(stored||"").split(":");
    if(!salt||!hex)return false;
    const actual=crypto.scryptSync(String(password),salt,64);
    const expected=Buffer.from(hex,"hex");
    return actual.length===expected.length&&crypto.timingSafeEqual(actual,expected);
  }catch{return false;}
}

function sign(payload){
  if(!configured())throw Object.assign(new Error("USER_SESSION_SECRET_NOT_CONFIGURED"),{status:503});
  const body=Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature=crypto.createHmac("sha256",secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verify(token){
  try{
    const [body,sig]=String(token||"").split(".");
    if(!body||!sig||!configured())return null;
    const expected=crypto.createHmac("sha256",secret()).update(body).digest();
    const actual=Buffer.from(sig,"base64url");
    if(expected.length!==actual.length||!crypto.timingSafeEqual(expected,actual))return null;
    const payload=JSON.parse(Buffer.from(body,"base64url").toString("utf8"));
    if(!payload?.userId||!payload?.email||!payload?.exp||Date.now()>=payload.exp)return null;
    return payload;
  }catch{return null;}
}

function parseCookies(request){
  const out={};
  for(const part of String(request.headers?.cookie||"").split(";")){
    const i=part.indexOf("=");if(i<0)continue;
    out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim());
  }
  return out;
}

function getUserSession(request){return verify(parseCookies(request)[COOKIE]);}

function issueUserSession(response,user,{persistent=true}={}){
  const exp=persistent?Date.now()+SESSION_MS:Date.now()+1000*60*60*12;
  const token=sign({userId:user.id,email:user.email,role:user.role||"user",exp,persistent:Boolean(persistent)});
  const attrs=[`${COOKIE}=${encodeURIComponent(token)}`,"Path=/","HttpOnly","Secure","SameSite=Strict"];
  if(persistent)attrs.push(`Max-Age=${Math.floor(SESSION_MS/1000)}`);
  response.setHeader("Set-Cookie",attrs.join("; "));
  return token;
}

function clearUserSession(response){response.setHeader("Set-Cookie",`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);}

export {configured,hashPassword,verifyPassword,getUserSession,issueUserSession,clearUserSession};
