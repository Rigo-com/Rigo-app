const state=Object.seal({initialized:false,booted:false,analyzing:false,project:null,files:[],results:[],lastQuery:null,lastError:null,diagnostics:{analyses:0,fileAnalyses:0,reads:0,searches:0,edits:0,generations:0},logs:[]});
const setInitialized=value=>(state.initialized=Boolean(value));
const setBooted=value=>(state.booted=Boolean(value));
const setAnalyzing=value=>(state.analyzing=Boolean(value));
const setProject=value=>(state.project=value||null);
const setFiles=value=>(state.files=Array.isArray(value)?value:[]);
const setResults=value=>(state.results=Array.isArray(value)?value:[]);
const setError=value=>(state.lastError=value||null);
function log(type,message,data=null){state.logs.push({type,message,data,timestamp:Date.now()});}
function reset(){state.initialized=false;state.booted=false;state.analyzing=false;state.project=null;state.files=[];state.results=[];state.lastQuery=null;state.lastError=null;state.diagnostics={analyses:0,fileAnalyses:0,reads:0,searches:0,edits:0,generations:0};state.logs=[];return true;}
const snapshot=()=>structuredClone(state);
const CodeAgentState=Object.freeze({state,setInitialized,setBooted,setAnalyzing,setProject,setFiles,setResults,setError,log,reset,snapshot});
export{state,setInitialized,setBooted,setAnalyzing,setProject,setFiles,setResults,setError,log,reset,snapshot,CodeAgentState};export default CodeAgentState;
