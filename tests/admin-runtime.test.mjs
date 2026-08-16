import assert from "node:assert/strict";
import crypto from "node:crypto";
import ExecutionEngine from "../js/admin/admin-agent/execution/execution-engine.js";
import ExecutionPlan from "../js/admin/admin-agent/execution/execution-plan.js";
import AdminAgentPermissions from "../js/admin/admin-agent/admin-agent-permissions.js";

process.env.RIGO_ADMIN_EMAIL="admin@rigo.test";
process.env.RIGO_ADMIN_SESSION_SECRET="test-secret";
const { getAdminSession, requireAdminSession }=await import("../server/admin-auth.js");

const payload=Buffer.from(JSON.stringify({email:"admin@rigo.test",role:"admin",persistent:false,issuedAt:Date.now()}),"utf8").toString("base64url");
const signature=crypto.createHmac("sha256","test-secret").update(payload).digest("base64url");
const request={headers:{cookie:`rigo_admin_session=${payload}.${signature}`}};
assert.equal(getAdminSession(request)?.role,"admin");
let denied=null;requireAdminSession({headers:{}},{status(code){denied=code;return this;},json(){return this;}});
assert.equal(denied,403);

ExecutionEngine.initialize();
ExecutionEngine.registerHandler(ExecutionPlan.OperationTypes.UPDATE_FILE,async()=>({ok:false,error:"WRITE_FAILED"}));
const plan=ExecutionPlan.create({id:"PLAN-TEST"});
const operation=ExecutionPlan.createNode({id:"OP-1",type:ExecutionPlan.OperationTypes.UPDATE_FILE});
plan.graph.nodes[operation.id]=operation;
const result=await ExecutionEngine.executePlan(plan);
assert.equal(result.ok,false);
assert.equal(plan.status,ExecutionPlan.Status.FAILED);
assert.equal(operation.status,ExecutionPlan.OperationStatus.FAILED);
assert.equal(ExecutionEngine.snapshot().diagnostics.failedOperations,1);
assert.equal(AdminAgentPermissions.requireApproval(),true);
assert.equal(AdminAgentPermissions.allowExecution(),true);
assert.equal(AdminAgentPermissions.allowWriteExecution(),true);
assert.equal(AdminAgentPermissions.allowDeleteExecution(),true);
console.log("Admin security and execution tests passed");
