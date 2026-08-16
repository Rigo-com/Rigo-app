import assert from "node:assert/strict";
import Execution from "../js/admin/admin-agent/execution/index.js";
import ExecutionPlan from "../js/admin/admin-agent/execution/execution-plan.js";

Execution.reset();Execution.initialize();
const order=[];
Execution.registerHandler(ExecutionPlan.OperationTypes.UPDATE_FILE,async operation=>{order.push("start-"+operation.id);await new Promise(resolve=>setTimeout(resolve,5));order.push("end-"+operation.id);return{ok:true};});
function plan(id,op){const value=ExecutionPlan.create({id});value.approval.approved=true;const node=ExecutionPlan.createNode({id:op,type:ExecutionPlan.OperationTypes.UPDATE_FILE});value.graph.nodes[node.id]=node;return value;}
const first=plan("PLAN-Q1","OP-1"),second=plan("PLAN-Q2","OP-2");
const [a,b]=await Promise.all([Execution.execute(first),Execution.execute(second)]);
assert.equal(a.ok,true);assert.equal(b.ok,true);
assert.deepEqual(order,["start-OP-1","end-OP-1","start-OP-2","end-OP-2"]);
assert.equal(Execution.snapshot().queue.pending.length,0);
assert.equal(Execution.snapshot().history.count,2);
assert.equal(Execution.history()[0].planId,"PLAN-Q2");

const blocker=plan("PLAN-Q3","OP-3"),cancelled=plan("PLAN-Q4","OP-4");
const running=Execution.execute(blocker);const pending=Execution.execute(cancelled);
assert.equal(Execution.cancel("PLAN-Q4"),true);
assert.equal((await pending).error,"EXECUTION_CANCELLED");
await running;
console.log("Admin execution queue and history tests passed");
