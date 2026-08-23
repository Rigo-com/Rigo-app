// =====================================
// RIGO AI
// ADMIN ROOT API
// PRIVATE ADMIN SYSTEM
// =====================================

import AdminRuntime from "./runtime/index.js";
import createAdminDebugPanel from "./admin-debug-panel.js";

async function hasServerAdminSession(){
  if(typeof window === "undefined") return true;
  try{
    const response = await fetch("/api/admin-session",{
      method:"GET",
      credentials:"same-origin",
      cache:"no-store"
    });
    const data = await response.json().catch(()=>({}));
    return Boolean(response.ok && data?.authenticated && data?.admin);
  }catch{
    return false;
  }
}

async function initialize(){
  if(!(await hasServerAdminSession())) return false;
  return AdminRuntime.initialize();
}

async function boot(){
  if(!(await hasServerAdminSession())) return false;
  const result = await AdminRuntime.boot();

  if(typeof window !== "undefined" && result){
    window.Admin = Admin;
    const params = new URLSearchParams(window.location.search);
    if(params.get("adminDebug") === "1"){
      await createAdminDebugPanel(Admin);
    }
  }
  return result;
}

async function shutdown(){
  if(typeof window !== "undefined" && window.Admin === Admin){
    try{ delete window.Admin; }catch{ window.Admin=undefined; }
  }
  return AdminRuntime.shutdown();
}

async function recover(){
  if(!(await hasServerAdminSession())) return false;
  return AdminRuntime.recover();
}

async function reset(){
  return AdminRuntime.reset();
}

async function command(input){
  if(!(await hasServerAdminSession())){
    return { ok:false,error:"SERVER_ADMIN_ACCESS_REQUIRED" };
  }

  const agentModule = AdminRuntime.registry.get("admin-agent");
  if(!agentModule || typeof agentModule.command !== "function"){
    return { ok:false,error:"ADMIN_AGENT_COMMAND_NOT_AVAILABLE" };
  }
  return agentModule.command(input);
}

async function debug(action="capture"){
  if(!(await hasServerAdminSession())){
    return { ok:false,error:"SERVER_ADMIN_ACCESS_REQUIRED" };
  }

  const agent = AdminRuntime.registry.get("debug-agent");
  if(!agent){
    return { ok:false,error:"ADMIN_DEBUG_AGENT_NOT_AVAILABLE" };
  }

  const method = String(action || "capture").trim().toLowerCase();
  if(method === "capture" || method === "diagnose") return agent.capture?.();
  if(method === "scan" || method === "audit") return agent.scan?.();
  if(method === "report") return agent.report?.();
  if(method === "errors") return agent.errors?.();
  if(method === "snapshot") return {ok:true,mode:"admin-debug-state",snapshot:agent.snapshot?.()};
  return {ok:false,error:"UNKNOWN_ADMIN_DEBUG_ACTION",action:method};
}

function snapshot(){
  return AdminRuntime.snapshot();
}

const Admin = Object.freeze({
  id:"admin",
  priority:30,
  initialize,
  boot,
  shutdown,
  recover,
  reset,
  command,
  debug,
  snapshot,
  runtime:AdminRuntime
});

export {
  hasServerAdminSession,
  initialize,
  boot,
  shutdown,
  recover,
  reset,
  command,
  debug,
  snapshot,
  Admin
};

export default Admin;
