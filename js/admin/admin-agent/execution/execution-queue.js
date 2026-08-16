const state=Object.seal({initialized:false,running:false,activePlanId:null,pending:[],diagnostics:{queued:0,completed:0,failed:0,cancelled:0}});
function initialize(){state.initialized=true;return true;}
function drain(){
  if(state.running||state.pending.length===0)return;
  const item=state.pending.shift();
  if(item.cancelled){item.resolve({ok:false,error:"EXECUTION_CANCELLED",planId:item.plan.id});queueMicrotask(drain);return;}
  state.running=true;state.activePlanId=item.plan.id;
  Promise.resolve().then(()=>item.runner(item.plan)).then(result=>{if(result?.ok===false)state.diagnostics.failed++;else state.diagnostics.completed++;item.resolve(result);}).catch(error=>{state.diagnostics.failed++;item.resolve({ok:false,error:error?.message||String(error),plan:item.plan});}).finally(()=>{state.running=false;state.activePlanId=null;queueMicrotask(drain);});
}
function enqueue(plan,runner){
  initialize();
  if(!plan?.id)return Promise.resolve({ok:false,error:"PLAN_ID_REQUIRED"});
  if(typeof runner!=="function")return Promise.resolve({ok:false,error:"QUEUE_RUNNER_REQUIRED"});
  if(state.activePlanId===plan.id||state.pending.some(item=>item.plan.id===plan.id))return Promise.resolve({ok:false,error:"PLAN_ALREADY_QUEUED",planId:plan.id});
  state.diagnostics.queued++;
  return new Promise(resolve=>{state.pending.push({plan,runner,resolve,cancelled:false,queuedAt:Date.now()});drain();});
}
function cancel(planId){
  const item=state.pending.find(entry=>entry.plan.id===planId);
  if(!item)return false;
  item.cancelled=true;state.pending=state.pending.filter(entry=>entry!==item);state.diagnostics.cancelled++;
  item.resolve({ok:false,error:"EXECUTION_CANCELLED",planId});return true;
}
function clear(){for(const item of state.pending)item.resolve({ok:false,error:"EXECUTION_QUEUE_CLEARED",planId:item.plan.id});state.pending=[];return true;}
function reset(){clear();state.initialized=false;state.running=false;state.activePlanId=null;state.diagnostics={queued:0,completed:0,failed:0,cancelled:0};return true;}
const snapshot=()=>Object.freeze({initialized:state.initialized,running:state.running,activePlanId:state.activePlanId,pending:state.pending.map(item=>({planId:item.plan.id,queuedAt:item.queuedAt,cancelled:item.cancelled})),diagnostics:{...state.diagnostics}});
const ExecutionQueue=Object.freeze({initialize,enqueue,cancel,clear,reset,snapshot});
export{initialize,enqueue,cancel,clear,reset,snapshot,ExecutionQueue};export default ExecutionQueue;
