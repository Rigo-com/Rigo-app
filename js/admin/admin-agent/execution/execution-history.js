const state=Object.seal({initialized:false,entries:[],limit:100});
function initialize(options={}){state.initialized=true;if(Number(options.limit)>0)state.limit=Math.floor(Number(options.limit));return true;}
function safe(value){try{return structuredClone(value);}catch{return JSON.parse(JSON.stringify(value));}}
function record(plan,result){
  initialize();
  const entry={id:`EXEC-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,planId:plan?.id||null,status:plan?.status||null,ok:result?.ok===true,error:result?.error||plan?.error||null,startedAt:plan?.execution?.startedAt||null,completedAt:plan?.execution?.completedAt||Date.now(),recordedAt:Date.now(),plan:safe(plan),result:safe(result)};
  state.entries.push(entry);if(state.entries.length>state.limit)state.entries.splice(0,state.entries.length-state.limit);return safe(entry);
}
function get(id){const entry=state.entries.find(item=>item.id===id||item.planId===id);return entry?safe(entry):null;}
function list(options={}){let entries=state.entries;if(options.status)entries=entries.filter(item=>item.status===options.status);if(options.ok!==undefined)entries=entries.filter(item=>item.ok===Boolean(options.ok));const limit=Math.max(1,Number(options.limit)||state.limit);return safe(entries.slice(-limit).reverse());}
function clear(){state.entries=[];return true;}
function reset(){state.initialized=false;state.entries=[];state.limit=100;return true;}
const snapshot=()=>Object.freeze({initialized:state.initialized,count:state.entries.length,limit:state.limit,latest:list({limit:10})});
const ExecutionHistory=Object.freeze({initialize,record,get,list,clear,reset,snapshot});
export{initialize,record,get,list,clear,reset,snapshot,ExecutionHistory};export default ExecutionHistory;
