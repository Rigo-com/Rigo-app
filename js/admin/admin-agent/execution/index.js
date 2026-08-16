import ExecutionBuilder from "./execution-builder.js";
import ExecutionEngine from "./execution-engine.js";
import ExecutionQueue from "./execution-queue.js";
import ExecutionHistory from "./execution-history.js";

function initialize(){ExecutionBuilder.initialize();ExecutionEngine.initialize();ExecutionQueue.initialize();ExecutionHistory.initialize();return true;}
const createPlan=options=>ExecutionBuilder.createPlan(options);
function execute(plan){
  initialize();
  return ExecutionQueue.enqueue(plan,async queuedPlan=>{
    const result=await ExecutionEngine.executePlan(queuedPlan);
    ExecutionHistory.record(queuedPlan,result);
    return result;
  });
}
const registerHandler=(type,handler)=>ExecutionEngine.registerHandler(type,handler);
const cancel=planId=>ExecutionQueue.cancel(planId);
const history=options=>ExecutionHistory.list(options);
function reset(){ExecutionQueue.reset();ExecutionHistory.reset();return true;}
const snapshot=()=>({builder:ExecutionBuilder.snapshot(),engine:ExecutionEngine.snapshot(),queue:ExecutionQueue.snapshot(),history:ExecutionHistory.snapshot()});
const Execution=Object.freeze({initialize,createPlan,execute,registerHandler,cancel,history,reset,snapshot,queue:ExecutionQueue,records:ExecutionHistory});
export{initialize,createPlan,execute,registerHandler,cancel,history,reset,snapshot,Execution};export default Execution;
