import CodeAgentState from "./code-agent-state.js";
import CodeIndex from "./code-index.js";
import ProjectAgent from "../project-agent/index.js";
import GitHubProvider from "../project-agent/providers/github-provider.js";

function initialize(){if(CodeAgentState.state.initialized)return true;CodeAgentState.setInitialized(true);CodeAgentState.log("system","CODE AGENT INITIALIZED");return true;}
async function boot(){initialize();CodeAgentState.setBooted(true);CodeAgentState.log("system","CODE AGENT BOOTED");return true;}
function projectSnapshot(){const result=ProjectAgent.query({type:"snapshot"});return result?.ok?result.result:null;}
export function analyzeFileContent(path,content,project={}){
  const source=String(content||"");
  const imports=[...source.matchAll(/(?:import\s+(?:[\s\S]*?\s+from\s+)?|export\s+[\s\S]*?\s+from\s+)["']([^"']+)["']/g)].map(match=>match[1]);
  const exports=[...source.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)].map(match=>match[1]);
  const issues=[];
  if(!source.trim())issues.push({severity:"warning",code:"EMPTY_FILE"});
  for(const match of source.matchAll(/\b(?:TODO|FIXME|HACK)\b[^\n]*/g))issues.push({severity:"info",code:"DEVELOPMENT_MARKER",message:match[0].trim()});
  if(source.split("\n").length>1000)issues.push({severity:"warning",code:"VERY_LARGE_SOURCE"});
  return{path,size:new TextEncoder().encode(source).length,lines:source?source.split("\n").length:0,imports:[...new Set(imports)],exports:[...new Set(exports)],functions:(source.match(/\bfunction\b|=>/g)||[]).length,classes:(source.match(/\bclass\s+[A-Za-z_$]/g)||[]).length,issues,content:source,projectReady:Boolean(project.ready)};
}
async function read(path){
  initialize();const result=await GitHubProvider.readFile(path);
  if(!result?.ok){CodeAgentState.setError(result?.error);return result;}
  CodeAgentState.state.diagnostics.reads++;return result;
}
async function analyze(path=null){
  initialize();CodeAgentState.setAnalyzing(true);CodeAgentState.setError(null);
  try{
    const project=projectSnapshot();
    if(!project)return{ok:false,error:"PROJECT_NOT_READY"};
    CodeAgentState.setProject({ready:project.ready,updatedAt:project.updatedAt});
    CodeAgentState.setFiles(project.files||[]);
    CodeIndex.setProject(project);
    if(path){
      const result=await read(path);if(!result.ok)return result;
      const analysis=analyzeFileContent(result.path,result.content,project);
      CodeIndex.setFileAnalysis(analysis);CodeAgentState.setResults([analysis]);CodeAgentState.state.diagnostics.fileAnalyses++;
      return{ok:true,mode:"file-analysis",analysis};
    }
    const results=CodeIndex.snapshot().analyses;CodeAgentState.setResults(results);CodeAgentState.state.diagnostics.analyses++;
    return{ok:true,mode:"project-code-analysis",files:results.length,diagnostics:CodeIndex.snapshot().diagnostics,analyses:results};
  }catch(error){CodeAgentState.setError(error);return{ok:false,error:error?.message||String(error)};}
  finally{CodeAgentState.setAnalyzing(false);}
}
function search(keyword){CodeAgentState.state.lastQuery=keyword;CodeAgentState.state.diagnostics.searches++;return{ok:true,mode:"code-search",results:CodeIndex.search(keyword)};}
async function shutdown(){CodeAgentState.setBooted(false);return true;}
async function reset(){CodeIndex.clear();CodeAgentState.reset();return true;}
const snapshot=()=>({state:CodeAgentState.snapshot(),index:CodeIndex.snapshot()});
const CodeAgent=Object.freeze({id:"code-agent",priority:40,initialize,boot,read,analyze,search,shutdown,reset,snapshot});
export{initialize,boot,read,analyze,search,shutdown,reset,snapshot,CodeAgent};export default CodeAgent;
