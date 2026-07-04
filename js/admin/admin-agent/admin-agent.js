// =====================================
// RIGO AI
// ADMIN AGENT CORE
// =====================================

import AdminAgentState
from "./admin-agent-state.js";

import AdminAgentPermissions
from "./admin-agent-permissions.js";

import ProjectAgent
from "./subagents/project-agent/index.js";

import CodeAgent
from "./subagents/code-agent/index.js";



// =====================================
// INITIALIZE
// =====================================

async function initialize(){

  try{

    if(AdminAgentState.state.initialized){

      return true;

    }

    await ProjectAgent.initialize();
    await CodeAgent.initialize();

    AdminAgentState.setInitialized(true);
    AdminAgentState.log("system","ADMIN AGENT INITIALIZED");

    return true;

  }
  catch(error){

    AdminAgentState.setError(error);
    return false;

  }

}



// =====================================
// BOOT
// =====================================

async function boot(){

  try{

    if(!AdminAgentState.state.initialized){

      await initialize();

    }

    await ProjectAgent.boot();
    await CodeAgent.boot();

    AdminAgentState.setBooted(true);
    AdminAgentState.log("system","ADMIN AGENT BOOTED");

    return true;

  }
  catch(error){

    AdminAgentState.setError(error);
    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdown(){

  await ProjectAgent.shutdown();
  await CodeAgent.shutdown();

  AdminAgentState.setBooted(false);
  AdminAgentState.log("system","ADMIN AGENT SHUTDOWN");

  return true;

}



// =====================================
// RESET
// =====================================

async function reset(){

  await ProjectAgent.reset();
  await CodeAgent.reset();

  AdminAgentState.reset();
  AdminAgentState.log("system","ADMIN AGENT RESET");

  return true;

}



// =====================================
// PROJECT COMMAND
// =====================================

async function handleProjectCommand(input){

  const normalized =
  String(input || "").trim().toLowerCase();

  if(
    normalized === "scan project" ||
    normalized === "افحص المشروع" ||
    normalized === "حلل المشروع"
  ){

    return ProjectAgent.scan();

  }

  if(
    normalized === "project snapshot" ||
    normalized === "حالة المشروع"
  ){

    return ProjectAgent.query({ type:"snapshot" });

  }

  if(
    normalized === "list files" ||
    normalized === "اعرض الملفات"
  ){

    return ProjectAgent.query({ type:"files" });

  }

  if(
    normalized === "list folders" ||
    normalized === "اعرض الفولدرات"
  ){

    return ProjectAgent.query({ type:"folders" });

  }

  if(
    normalized === "list systems" ||
    normalized === "اعرض الانظمة" ||
    normalized === "اعرض الأنظمة"
  ){

    return ProjectAgent.query({ type:"systems" });

  }

  return null;

}



// =====================================
// CODE COMMAND
// =====================================

async function handleCodeCommand(input){

  const normalized =
  String(input || "").trim().toLowerCase();

  if(
    normalized === "analyze code" ||
    normalized === "حلل الكود"
  ){

    return CodeAgent.analyze();

  }

  return null;

}



// =====================================
// COMMAND
// =====================================

async function command(input){

  if(!input){

    return {
      ok:false,
      error:"EMPTY_ADMIN_AGENT_COMMAND"
    };

  }

  AdminAgentState.state.lastCommand = input;
  AdminAgentState.state.diagnostics.commands += 1;
  AdminAgentState.log("command",input);

  const projectResult =
  await handleProjectCommand(input);

  if(projectResult){

    AdminAgentState.state.lastResult = projectResult;
    return projectResult;

  }

  const codeResult =
  await handleCodeCommand(input);

  if(codeResult){

    AdminAgentState.state.lastResult = codeResult;
    return codeResult;

  }

  const result = {

    ok:true,

    mode:"admin-agent-router",

    message:
    "Admin Agent command received. No matching private subagent route found yet.",

    supportedCommands:[
      "scan project",
      "project snapshot",
      "list files",
      "list folders",
      "list systems",
      "analyze code",
      "افحص المشروع",
      "حلل المشروع",
      "حالة المشروع",
      "اعرض الملفات",
      "اعرض الفولدرات",
      "اعرض الأنظمة",
      "حلل الكود"
    ],

    permissions:
    AdminAgentPermissions.snapshot(),

    timestamp:
    Date.now()

  };

  AdminAgentState.state.lastResult = result;

  return result;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    state:
    AdminAgentState.snapshot(),

    permissions:
    AdminAgentPermissions.snapshot(),

    privateSubagents:{

      project:
      ProjectAgent.snapshot(),

      code:
      CodeAgent.snapshot()

    }

  };

}



// =====================================
// API
// =====================================

const AdminAgent =
Object.freeze({

  id:"admin-agent",

  priority:30,

  initialize,

  boot,

  shutdown,

  reset,

  command,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  boot,

  shutdown,

  reset,

  command,

  snapshot,

  AdminAgent

};

export default
AdminAgent;
