const state=Object.seal({files:[],analyses:[],search:[],diagnostics:{files:0,analyzed:0,issues:0,imports:0,exports:0}});
function setProject(project={}){
  state.files=Array.isArray(project.files)?project.files:[];
  const imports=Array.isArray(project.imports)?project.imports:[];
  const exports=Array.isArray(project.exports)?project.exports:[];
  const relationships=Array.isArray(project.relationships)?project.relationships:[];
  state.analyses=state.files.map(file=>{
    const fileImports=imports.filter(item=>item.file===file.path);
    const fileExports=exports.filter(item=>item.file===file.path);
    const dependencies=relationships.filter(item=>item.from===file.path).map(item=>item.to);
    const dependents=relationships.filter(item=>item.to===file.path).map(item=>item.from);
    const issues=[];
    if(Number(file.size)===0)issues.push({severity:"warning",code:"EMPTY_FILE"});
    if(Number(file.size)>250000)issues.push({severity:"warning",code:"LARGE_FILE"});
    return{path:file.path,size:file.size||0,imports:fileImports,exports:fileExports,dependencies:[...new Set(dependencies)],dependents:[...new Set(dependents)],issues};
  });
  state.diagnostics={files:state.files.length,analyzed:state.analyses.length,issues:state.analyses.reduce((sum,item)=>sum+item.issues.length,0),imports:imports.length,exports:exports.length};
  return true;
}
function setFileAnalysis(analysis){const index=state.analyses.findIndex(item=>item.path===analysis.path);if(index>=0)state.analyses[index]={...state.analyses[index],...analysis};else state.analyses.push(analysis);state.diagnostics.analyzed=state.analyses.length;state.diagnostics.issues=state.analyses.reduce((sum,item)=>sum+(item.issues?.length||0),0);return true;}
function search(keyword){const value=String(keyword||"").trim().toLowerCase();state.search=value?state.analyses.filter(item=>JSON.stringify(item).toLowerCase().includes(value)):[];return structuredClone(state.search);}
function query(type,value=null){if(type==="search")return search(value);return Object.prototype.hasOwnProperty.call(state,type)?structuredClone(state[type]):null;}
function clear(){state.files=[];state.analyses=[];state.search=[];state.diagnostics={files:0,analyzed:0,issues:0,imports:0,exports:0};return true;}
const snapshot=()=>structuredClone(state);
const CodeIndex=Object.freeze({set:setProject,setProject,setFileAnalysis,search,query,clear,snapshot});
export{setProject,setFileAnalysis,search,query,clear,snapshot,CodeIndex};export default CodeIndex;
