const state=Object.seal({initialized:false,booted:false,analyzing:false,lastReport:null,lastError:null,diagnostics:{analyses:0,violations:0,warnings:0},logs:[]});
const set=value=>Object.assign(state,value);
function log(type,message,data=null){state.logs.push({type,message,data,timestamp:Date.now()});}
function reset(){state.initialized=false;state.booted=false;state.analyzing=false;state.lastReport=null;state.lastError=null;state.diagnostics={analyses:0,violations:0,warnings:0};state.logs=[];return true;}
const snapshot=()=>structuredClone(state);
const ArchitectureAgentState=Object.freeze({state,set,log,reset,snapshot});
export{state,set,log,reset,snapshot,ArchitectureAgentState};export default ArchitectureAgentState;
