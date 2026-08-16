import assert from "node:assert/strict";
import Execution from "../js/admin/admin-agent/execution/index.js";
import ExecutionPlan from "../js/admin/admin-agent/execution/execution-plan.js";

Execution.reset();Execution.initialize();
const events=[];
Execution.registerHandler(ExecutionPlan.OperationTypes.UPDATE_FILE,async operation=>{events.push("execute-"+operation.id);return{ok:true};});
Execution.registerHandler(ExecutionPlan.OperationTypes.DELETE_FILE,async operation=>{events.push("execute-"+operation.id);return{ok:false,error:"DELETE_FAILED"};});
Execution.registerRollbackHandler(ExecutionPlan.OperationTypes.UPDATE_FILE,async operation=>{events.push("rollback-"+operation.id);return{ok:true};});

const plan=ExecutionPlan.create({id:"PLAN-ROLLBACK"});
const first=ExecutionPlan.createNode({id:"OP-UPDATE",type:ExecutionPlan.OperationTypes.UPDATE_FILE});
const second=ExecutionPlan.createNode({id:"OP-DELETE",type:ExecutionPlan.OperationTypes.DELETE_FILE});
plan.graph.nodes[first.id]=first;plan.graph.nodes[second.id]=second;
const result=await Execution.execute(plan);
assert.equal(result.ok,false);
assert.equal(result.rolledBack,true);
assert.equal(plan.status,ExecutionPlan.Status.ROLLED_BACK);
assert.equal(plan.rollback.completed,true);
assert.deepEqual(events,["execute-OP-UPDATE","execute-OP-DELETE","rollback-OP-UPDATE"]);
assert.equal(Execution.snapshot().engine.diagnostics.rollbacks,1);
assert.equal(Execution.history()[0].status,ExecutionPlan.Status.ROLLED_BACK);
console.log("Admin rollback tests passed");
