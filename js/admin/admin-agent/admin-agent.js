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

import ArchitectureAgent
from "./subagents/architecture-agent/index.js";

import DebugAgent
from "./subagents/debug-agent/index.js";

import GitAgent
from "./subagents/git-agent/index.js";

import TestAgent
from "./subagents/test-agent/index.js";

import DocumentationAgent
from "./subagents/documentation-agent/index.js";

import GitHubProvider
from "./subagents/project-agent/providers/github-provider.js";

import Execution
from "./execution/index.js";

import ExecutionBuilder
from "./execution/execution-builder.js";

import ExecutionPlan
from "./execution/execution-plan.js";



// =====================================
// INTERNAL STATE
// =====================================

const adminExecutionState =
Object.seal({

  initialized:
  false,

  pendingPlans:
  {},

  lastPlanId:
  null

});



// =====================================
// EXECUTION HANDLERS
// =====================================

async function handleCreateFileOperation(
  operation
){

  return GitHubProvider
  .createFile(

    operation.payload.path,

    operation.payload.content || "",

    operation.payload.message || null

  );

}



async function handleUpdateFileOperation(
  operation
){
  const backup=await GitHubProvider.readFile(operation.payload.path);
  if(!backup?.ok)return backup;
  operation.backup={path:backup.path,content:backup.content,sha:backup.sha};

  return GitHubProvider.updateFile(
    operation.payload.path,
    operation.payload.content || "",
    operation.payload.message || null
  );
}



async function handleDeleteFileOperation(
  operation
){
  const backup=await GitHubProvider.readFile(operation.payload.path);
  if(!backup?.ok)return backup;
  operation.backup={path:backup.path,content:backup.content,sha:backup.sha};

  return GitHubProvider.deleteFile(
    operation.payload.path,
    operation.payload.message || null
  );
}



async function handleMoveFileOperation(
  operation
){
  const backup=await GitHubProvider.readFile(operation.payload.sourcePath);
  if(!backup?.ok)return backup;
  operation.backup={path:backup.path,content:backup.content,sha:backup.sha};

  return GitHubProvider.moveFile(
    operation.payload.sourcePath,
    operation.payload.destinationPath,
    operation.payload.message || null
  );
}

async function rollbackFileOperation(operation){
  const type=operation.type;
  if(type===ExecutionPlan.OperationTypes.CREATE_FILE){
    return GitHubProvider.deleteFile(operation.payload.path,"RIGO Admin rollback create");
  }
  if(type===ExecutionPlan.OperationTypes.UPDATE_FILE){
    if(!operation.backup)return{ok:false,error:"ROLLBACK_BACKUP_MISSING"};
    return GitHubProvider.updateFile(operation.backup.path,operation.backup.content,"RIGO Admin rollback update");
  }
  if(type===ExecutionPlan.OperationTypes.DELETE_FILE){
    if(!operation.backup)return{ok:false,error:"ROLLBACK_BACKUP_MISSING"};
    return GitHubProvider.createFile(operation.backup.path,operation.backup.content,"RIGO Admin rollback delete");
  }
  if(type===ExecutionPlan.OperationTypes.MOVE_FILE){
    return GitHubProvider.moveFile(operation.payload.destinationPath,operation.payload.sourcePath,"RIGO Admin rollback move");
  }
  return{ok:false,error:`ROLLBACK_UNSUPPORTED:${type}`};
}



// =====================================
// INITIALIZE EXECUTION
// =====================================

function initializeExecution(){

  if(
    adminExecutionState.initialized
  ){

    return true;

  }

  Execution.initialize();

  Execution.registerHandler(

    ExecutionPlan
    .OperationTypes
    .CREATE_FILE,

    handleCreateFileOperation

  );

  Execution.registerHandler(

    ExecutionPlan
    .OperationTypes
    .UPDATE_FILE,

    handleUpdateFileOperation

  );

  Execution.registerHandler(

    ExecutionPlan
    .OperationTypes
    .DELETE_FILE,

    handleDeleteFileOperation

  );

  Execution.registerHandler(

    ExecutionPlan
    .OperationTypes
    .MOVE_FILE,

    handleMoveFileOperation

  );

  for(const type of [
    ExecutionPlan.OperationTypes.CREATE_FILE,
    ExecutionPlan.OperationTypes.UPDATE_FILE,
    ExecutionPlan.OperationTypes.DELETE_FILE,
    ExecutionPlan.OperationTypes.MOVE_FILE
  ]){
    Execution.registerRollbackHandler(type,rollbackFileOperation);
  }

  adminExecutionState.initialized =
  true;

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initialize(){

  try{

    if(
      AdminAgentState
      .state
      .initialized
    ){

      return true;

    }

    await ProjectAgent
    .initialize();

    await CodeAgent
    .initialize();

    await ArchitectureAgent.initialize();

    initializeExecution();

    AdminAgentState
    .setInitialized(
      true
    );

    AdminAgentState
    .log(
      "system",
      "ADMIN AGENT INITIALIZED"
    );

    return true;

  }
  catch(error){

    AdminAgentState
    .setError(
      error
    );

    return false;

  }

}



// =====================================
// BOOT
// =====================================

async function boot(){

  try{

    if(
      !AdminAgentState
      .state
      .initialized
    ){

      await initialize();

    }

    await ProjectAgent
    .boot();

    await CodeAgent
    .boot();

    await ArchitectureAgent.boot();

    initializeExecution();

    AdminAgentState
    .setBooted(
      true
    );

    AdminAgentState
    .log(
      "system",
      "ADMIN AGENT BOOTED"
    );

    return true;

  }
  catch(error){

    AdminAgentState
    .setError(
      error
    );

    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdown(){

  await ProjectAgent
  .shutdown();

  await CodeAgent
  .shutdown();

  await ArchitectureAgent.shutdown();

  AdminAgentState
  .setBooted(
    false
  );

  AdminAgentState
  .log(
    "system",
    "ADMIN AGENT SHUTDOWN"
  );

  return true;

}



// =====================================
// RESET
// =====================================

async function reset(){

  await ProjectAgent
  .reset();

  await CodeAgent
  .reset();

  await ArchitectureAgent.reset();

  adminExecutionState.pendingPlans =
  {};

  adminExecutionState.lastPlanId =
  null;

  Execution.reset();

  AdminAgentState
  .reset();

  AdminAgentState
  .log(
    "system",
    "ADMIN AGENT RESET"
  );

  return true;

}



// =====================================
// NORMALIZATION
// =====================================

function normalizeText(
  value
){

  return String(
    value || ""
  )
  .trim();

}



function normalizeCommand(
  value
){

  return normalizeText(
    value
  )
  .toLowerCase();

}



// =====================================
// PLAN STORAGE
// =====================================

function storePendingPlan(
  plan
){

  adminExecutionState
  .pendingPlans[
    plan.id
  ] =
  plan;

  adminExecutionState.lastPlanId =
  plan.id;

  return plan;

}



function getPendingPlan(
  planId
){

  return (
    adminExecutionState
    .pendingPlans[
      planId
    ] ||
    null
  );

}



function listPendingPlans(){

  return Object
  .values(
    adminExecutionState
    .pendingPlans
  )
  .map(
    function(plan){

      return ExecutionPlan
      .snapshot(
        plan
      );

    }
  );

}



// =====================================
// PLAN RESPONSE
// =====================================

function createPendingPlanResponse(
  plan
){

  return {

    ok:true,

    mode:
    "execution-plan",

    status:
    "waiting-approval",

    message:
    "Execution plan created. Approval is required before execution.",

    plan:
    ExecutionPlan.snapshot(
      plan
    ),

    nextCommands:[

      `approve ${plan.id}`,

      `execute ${plan.id}`,

      `approve and execute ${plan.id}`

    ]

  };

}



// =====================================
// CREATE FILE PLAN
// =====================================

function createFilePlan(
  path,
  content = ""
){

  const plan =
  ExecutionBuilder
  .buildCreateFilePlan({

    path,

    content,

    title:
    `Create ${path}`

  });

  storePendingPlan(
    plan
  );

  return createPendingPlanResponse(
    plan
  );

}



// =====================================
// UPDATE FILE PLAN
// =====================================

function createUpdateFilePlan(
  path,
  content = ""
){

  const plan =
  ExecutionBuilder
  .buildUpdateFilePlan({

    path,

    content,

    title:
    `Update ${path}`

  });

  storePendingPlan(
    plan
  );

  return createPendingPlanResponse(
    plan
  );

}



// =====================================
// DELETE FILE PLAN
// =====================================

function createDeleteFilePlan(
  path
){

  const plan =
  ExecutionBuilder
  .buildDeleteFilePlan({

    path,

    title:
    `Delete ${path}`

  });

  plan.risk.destructive =
  true;

  plan.risk.level =
  "high";

  plan.risk.score =
  80;

  storePendingPlan(
    plan
  );

  return createPendingPlanResponse(
    plan
  );

}



// =====================================
// MOVE FILE PLAN
// =====================================

function createMoveFilePlan(
  sourcePath,
  destinationPath
){

  const plan =
  ExecutionBuilder
  .buildMoveFilePlan({

    sourcePath,

    destinationPath,

    title:
    `Move ${sourcePath} to ${destinationPath}`

  });

  storePendingPlan(
    plan
  );

  return createPendingPlanResponse(
    plan
  );

}



// =====================================
// APPROVE PLAN
// =====================================

function approvePlan(
  planId
){

  const plan =
  getPendingPlan(
    planId
  );

  if(
    !plan
  ){

    return {

      ok:false,

      error:
      "EXECUTION_PLAN_NOT_FOUND"

    };

  }

  if(
    plan.status ===
    ExecutionPlan
    .Status
    .COMPLETED
  ){

    return {

      ok:false,

      error:
      "EXECUTION_PLAN_ALREADY_COMPLETED"

    };

  }

  plan.approval.approved =
  true;

  plan.approval.approvedBy =
  "admin";

  plan.approval.approvedAt =
  Date.now();

  plan.status =
  ExecutionPlan
  .Status
  .APPROVED;

  for(
    const operation
    of Object.values(
      plan.graph.nodes
    )
  ){

    operation.status =
    ExecutionPlan
    .OperationStatus
    .APPROVED;

  }

  return {

    ok:true,

    status:
    "approved",

    plan:
    ExecutionPlan.snapshot(
      plan
    )

  };

}



// =====================================
// EXECUTE PLAN
// =====================================

async function executeApprovedPlan(
  planId
){

  const plan =
  getPendingPlan(
    planId
  );

  if(
    !plan
  ){

    return {

      ok:false,

      error:
      "EXECUTION_PLAN_NOT_FOUND"

    };

  }

  if(
    !plan.approval.approved
  ){

    return {

      ok:false,

      error:
      "EXECUTION_PLAN_NOT_APPROVED",

      plan:
      ExecutionPlan.snapshot(
        plan
      )

    };

  }

  const operations = Object.values(plan.graph.nodes);
  const destructive = operations.some(operation =>
    operation.type === ExecutionPlan.OperationTypes.DELETE_FILE
  );

  if(
    !AdminAgentPermissions.allowExecution() ||
    !AdminAgentPermissions.allowWriteExecution() ||
    (destructive && !AdminAgentPermissions.allowDeleteExecution())
  ){
    return {
      ok:false,
      error:"ADMIN_EXECUTION_PERMISSION_DENIED",
      plan:ExecutionPlan.snapshot(plan)
    };
  }

  const result =
  await Execution
  .execute(
    plan
  );

  if(
    result.ok
  ){

    await ProjectAgent
    .scan();

  }

  return result;

}



// =====================================
// LOGIN COMMAND
// =====================================

async function handleLoginCommand(
  input
){

  const text =
  normalizeText(
    input
  );

  const match =
  text.match(
    /^(?:login admin|admin login|تسجيل دخول الادمن|دخول الادمن)\s+(.+)$/i
  );

  if(
    !match
  ){

    return null;

  }

  return GitHubProvider
  .authenticate(
    match[1].trim()
  );

}



// =====================================
// EXECUTION COMMAND
// =====================================

async function handleExecutionCommand(
  input
){

  if(
    input &&
    typeof input === "object"
  ){

    const type =
    normalizeCommand(
      input.type ||
      input.action
    );

    if(
      type === "create-file"
    ){

      return createFilePlan(
        input.path,
        input.content || ""
      );

    }

    if(
      type === "update-file"
    ){

      return createUpdateFilePlan(
        input.path,
        input.content || ""
      );

    }

    if(
      type === "delete-file"
    ){

      return createDeleteFilePlan(
        input.path
      );

    }

    if(
      type === "move-file"
    ){

      return createMoveFilePlan(
        input.sourcePath,
        input.destinationPath
      );

    }

    if(
      type === "approve-plan"
    ){

      return approvePlan(
        input.planId
      );

    }

    if(
      type === "execute-plan"
    ){

      return executeApprovedPlan(
        input.planId
      );

    }

    if(type === "cancel-plan"){
      const plan=getPendingPlan(input.planId);
      if(!plan)return{ok:false,error:"EXECUTION_PLAN_NOT_FOUND"};
      if(plan.status===ExecutionPlan.Status.RUNNING)return{ok:false,error:"EXECUTION_PLAN_RUNNING"};
      plan.status=ExecutionPlan.Status.CANCELLED;
      for(const operation of Object.values(plan.graph.nodes))operation.status=ExecutionPlan.OperationStatus.CANCELLED;
      delete adminExecutionState.pendingPlans[input.planId];
      return{ok:true,mode:"cancel-plan",planId:input.planId};
    }

    if(type === "execution-history"){
      return {ok:true,mode:"execution-history",entries:Execution.history(input.options || {})};
    }

    if(type === "cancel-execution"){
      return {ok:Execution.cancel(input.planId),mode:"cancel-execution",planId:input.planId};
    }

  }

  const text =
  normalizeText(
    input
  );

  if(/^(?:execution history|سجل التنفيذ)$/i.test(text)){
    return {ok:true,mode:"execution-history",entries:Execution.history()};
  }

  let match =
  text.match(
    /^(?:create file|انشئ ملف|أنشئ ملف)\s+(\S+)(?:\s*::\s*([\s\S]*))?$/i
  );

  if(
    match
  ){

    return createFilePlan(
      match[1],
      match[2] || ""
    );

  }

  match =
  text.match(
    /^(?:update file|عدل ملف|عدّل ملف)\s+(\S+)\s*::\s*([\s\S]*)$/i
  );

  if(
    match
  ){

    return createUpdateFilePlan(
      match[1],
      match[2] || ""
    );

  }

  match =
  text.match(
    /^(?:delete file|احذف ملف)\s+(\S+)$/i
  );

  if(
    match
  ){

    return createDeleteFilePlan(
      match[1]
    );

  }

  match =
  text.match(
    /^(?:move file|انقل ملف)\s+(\S+)\s*(?:->|إلى|الى)\s*(\S+)$/i
  );

  if(
    match
  ){

    return createMoveFilePlan(
      match[1],
      match[2]
    );

  }

  match =
  text.match(
    /^(?:approve and execute|وافق ونفذ|وافق ونفّذ)\s+(PLAN-\d+)$/i
  );

  if(
    match
  ){

    const approval =
    approvePlan(
      match[1]
    );

    if(
      !approval.ok
    ){

      return approval;

    }

    return executeApprovedPlan(
      match[1]
    );

  }

  match =
  text.match(
    /^(?:approve|وافق)\s+(PLAN-\d+)$/i
  );

  if(
    match
  ){

    return approvePlan(
      match[1]
    );

  }

  match =
  text.match(
    /^(?:execute|نفذ|نفّذ)\s+(PLAN-\d+)$/i
  );

  if(
    match
  ){

    return executeApprovedPlan(
      match[1]
    );

  }

  if(
    normalizeCommand(text) ===
    "pending plans" ||
    text === "الخطط المعلقة"
  ){

    return {

      ok:true,

      plans:
      listPendingPlans()

    };

  }

  return null;

}



// =====================================
// PROJECT COMMAND
// =====================================

async function handleProjectCommand(
  input
){

  const normalized =
  normalizeCommand(
    input
  );

  if(
    normalized === "scan project" ||
    normalized === "افحص المشروع" ||
    normalized === "حلل المشروع"
  ){

    return ProjectAgent
    .scan();

  }

  if(
    normalized === "project snapshot" ||
    normalized === "حالة المشروع"
  ){

    return ProjectAgent
    .query({
      type:"snapshot"
    });

  }

  if(
    normalized === "list files" ||
    normalized === "اعرض الملفات"
  ){

    return ProjectAgent
    .query({
      type:"files"
    });

  }

  if(
    normalized === "list folders" ||
    normalized === "اعرض الفولدرات"
  ){

    return ProjectAgent
    .query({
      type:"folders"
    });

  }

  if(
    normalized === "list systems" ||
    normalized === "اعرض الانظمة" ||
    normalized === "اعرض الأنظمة"
  ){

    return ProjectAgent
    .query({
      type:"systems"
    });

  }

  return null;

}



// =====================================
// CODE COMMAND
// =====================================

async function handleCodeCommand(
  input
){

  const normalized =
  normalizeCommand(
    input
  );

  if(
    input &&
    typeof input === "object"
  ){
    const action=normalizeCommand(input.action || input.type);
    if(action === "read-file") return CodeAgent.read(input.path);
    if(action === "analyze-file") return CodeAgent.analyze(input.path);
    if(action === "search-code") return CodeAgent.search(input.query);
  }

  let match=normalizeText(input).match(/^(?:read file|اقرأ ملف)\s+(.+)$/i);
  if(match) return CodeAgent.read(match[1].trim());

  match=normalizeText(input).match(/^(?:analyze file|حلل ملف)\s+(.+)$/i);
  if(match) return CodeAgent.analyze(match[1].trim());

  match=normalizeText(input).match(/^(?:search code|ابحث بالكود)\s+(.+)$/i);
  if(match) return CodeAgent.search(match[1].trim());

  if(
    normalized === "analyze code" ||
    normalized === "حلل الكود"
  ){

    return CodeAgent
    .analyze();

  }

  if(normalized === "analyze architecture" || normalized === "حلل المعمارية"){
    return ArchitectureAgent.analyze();
  }

  if(normalized === "debug report" || normalized === "تقرير الاخطاء" || normalized === "تقرير الأخطاء")return DebugAgent.report();
  if(normalized === "diagnose system" || normalized === "شخص النظام")return DebugAgent.capture();
  if(normalized === "list errors" || normalized === "اعرض الاخطاء" || normalized === "اعرض الأخطاء")return DebugAgent.errors();
  if(normalized === "git status" || normalized === "حالة git")return GitAgent.status();
  if(normalized === "git diff" || normalized === "تغييرات git")return GitAgent.diff();
  if(normalized === "git commits" || normalized === "سجل git")return GitAgent.commits();
  if(normalized === "test status" || normalized === "حالة الاختبارات")return TestAgent.status();
  if(normalized === "test failures" || normalized === "الاختبارات الفاشلة")return TestAgent.failures();
  if(normalized === "run tests" || normalized === "شغل الاختبارات")return TestAgent.run();
  if(normalized === "generate documentation" || normalized === "ولد التوثيق")return DocumentationAgent.generate();

  let documentationMatch=normalizeText(input).match(/^(?:document project|وثق المشروع)(?:\\s+(.+))?$/i);
  if(documentationMatch){
    const generated=DocumentationAgent.generate({path:documentationMatch[1]?.trim()||undefined});
    if(!generated.ok)return generated;
    DocumentationAgent.markPlanned();
    return generated.document.exists?createUpdateFilePlan(generated.document.path,generated.document.content):createFilePlan(generated.document.path,generated.document.content);
  }

  return null;

}



// =====================================
// COMMAND
// =====================================

async function command(
  input
){

  if(
    !input
  ){

    return {

      ok:false,

      error:
      "EMPTY_ADMIN_AGENT_COMMAND"

    };

  }

  AdminAgentState
  .state
  .lastCommand =
  input;

  AdminAgentState
  .state
  .diagnostics
  .commands +=
  1;

  AdminAgentState
  .log(
    "command",
    typeof input === "string"
    ? input
    : JSON.stringify(input)
  );

  const loginResult =
  await handleLoginCommand(
    input
  );

  if(
    loginResult
  ){

    AdminAgentState.state.lastResult =
    loginResult;

    return loginResult;

  }

  const executionResult =
  await handleExecutionCommand(
    input
  );

  if(
    executionResult
  ){

    AdminAgentState.state.lastResult =
    executionResult;

    return executionResult;

  }

  const projectResult =
  await handleProjectCommand(
    input
  );

  if(
    projectResult
  ){

    AdminAgentState.state.lastResult =
    projectResult;

    return projectResult;

  }

  const codeResult =
  await handleCodeCommand(
    input
  );

  if(
    codeResult
  ){

    AdminAgentState.state.lastResult =
    codeResult;

    return codeResult;

  }

  const result = {

    ok:true,

    mode:
    "admin-agent-router",

    message:
    "Admin Agent command received. No matching route found.",

    supportedCommands:[

      "login admin <secret>",

      "create file js/path/file.js :: content",

      "update file js/path/file.js :: content",

      "move file js/source.js -> js/destination.js",

      "delete file js/path/file.js",

      "approve PLAN-000001",

      "execute PLAN-000001",

      "approve and execute PLAN-000001",

      "pending plans",

      "execution history",

      "scan project",

      "project snapshot",

      "list files",

      "list folders",

      "list systems",

      "analyze code",

      "analyze architecture",

      "diagnose system",

      "debug report",

      "list errors",

      "git status",

      "git diff",

      "git commits",

      "test status",

      "test failures",

      "run tests",

      "generate documentation",

      "document project js/PROJECT-ARCHITECTURE.md",

      "read file js/path/file.js",

      "analyze file js/path/file.js",

      "search code keyword"

    ],

    permissions:
    AdminAgentPermissions
    .snapshot(),

    timestamp:
    Date.now()

  };

  AdminAgentState.state.lastResult =
  result;

  return result;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    state:
    AdminAgentState
    .snapshot(),

    permissions:
    AdminAgentPermissions
    .snapshot(),

    execution:{

      runtime:
      Execution.snapshot(),

      pendingPlans:
      listPendingPlans(),

      lastPlanId:
      adminExecutionState.lastPlanId

    },

    providers:{

      github:
      GitHubProvider.snapshot()

    },

    privateSubagents:{

      project:
      ProjectAgent.snapshot(),

      code:
      CodeAgent.snapshot(),

      architecture:
      ArchitectureAgent.snapshot(),

      debug:
      DebugAgent.snapshot(),

      git:
      GitAgent.snapshot(),

      test:
      TestAgent.snapshot(),

      documentation:
      DocumentationAgent.snapshot()

    }

  };

}



// =====================================
// API
// =====================================

const AdminAgent =
Object.freeze({

  id:
  "admin-agent",

  priority:
  30,

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
