import {executeAdminCommand} from "./admin-agent/admin-agent-loader.js";
import Auth from "../../../auth/index.js";

const PAGE_CONFIGS=Object.freeze([
  {id:"project",title:"Project",description:"Repository files, folders, and scan data.",actions:[["Scan Project","scan project"],["Project Snapshot","project snapshot"],["List Files","list files"],["List Folders","list folders"]]},
  {id:"code",title:"System",description:"Detected systems and source-code analysis.",actions:[["List Systems","list systems"],["Analyze Code","analyze code"],["Test Status","test status"],["Run Tests","run tests"]]},
  {id:"architecture",title:"Code Map",description:"Architecture, relationships, and project documentation.",actions:[["Analyze Architecture","analyze architecture"],["Generate Documentation","generate documentation"],["Project Snapshot","project snapshot"]]},
  {id:"memory",title:"Memory",description:"Open and inspect the RIGO memory subsystem.",actions:[["Open Memory","@memory"],["Refresh Status","@refresh"]]},
  {id:"git",title:"Extensions",description:"GitHub, tests, commits, and repository changes.",actions:[["Git Status","git status"],["Git Diff","git diff"],["Git Commits","git commits"],["Test Failures","test failures"],["Run Tests","run tests"]]},
  {id:"settings",title:"Settings",description:"Admin session and application controls.",actions:[["Refresh Admin Status","@refresh"],["Return to RIGO AI","@home"],["Log Out","@logout"]]}
]);

function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);}

function createSystemPage(config){
  const state={container:null,loading:false,result:null,error:null,lastAction:null};
  function render(){
    if(!state.container)return false;
    const output=state.error?`<div class="rigo-system-page-error">${escapeHTML(state.error)}</div>`:state.result!==null?`<pre>${escapeHTML(JSON.stringify(state.result,null,2))}</pre>`:`<div class="rigo-system-page-empty">Choose an action to load live data.</div>`;
    state.container.innerHTML=`<style>
      .rigo-system-page{min-height:100%;padding:20px 20px 110px;color:#f8fafc;background:#020817;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.rigo-system-page h1{font-size:26px;margin:0 0 7px}.rigo-system-page p{margin:0;color:#94a3b8;line-height:1.5}.rigo-system-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:20px 0}.rigo-system-actions button{min-height:52px;padding:10px 12px;border:1px solid #26364e;border-radius:13px;color:#eaf2ff;background:#0b1728;font-weight:700;cursor:pointer}.rigo-system-actions button:disabled{opacity:.5}.rigo-system-actions button:active{transform:scale(.98)}.rigo-system-output{min-height:220px;padding:16px;border:1px solid #203149;border-radius:16px;background:#071324;overflow:auto}.rigo-system-output pre{margin:0;color:#cbd5e1;font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere}.rigo-system-page-empty{color:#64748b}.rigo-system-page-error{color:#fda4af}@media(max-width:760px){.rigo-system-page{padding:18px 16px 120px}.rigo-system-page h1{font-size:24px}.rigo-system-actions{grid-template-columns:1fr 1fr}.rigo-system-output{max-height:55vh}}
    </style><section class="rigo-system-page"><h1>${escapeHTML(config.title)}</h1><p>${escapeHTML(config.description)}</p><div class="rigo-system-actions">${config.actions.map(([label,command])=>`<button type="button" data-system-command="${escapeHTML(command)}" ${state.loading?"disabled":""}>${escapeHTML(label)}</button>`).join("")}</div><div class="rigo-system-output">${state.loading?'<div class="rigo-system-page-empty">Loading…</div>':output}</div></section>`;
    state.container.querySelectorAll("[data-system-command]").forEach(button=>button.addEventListener("click",()=>run(button.dataset.systemCommand)));
    return true;
  }
  async function run(command){
    if(state.loading)return false;
    state.loading=true;state.error=null;state.lastAction=command;render();
    try{
      if(command==="@memory"){location.href="./memory.html";return true;}
      if(command==="@home"){location.href="./home.html";return true;}
      if(command==="@logout"){await Auth.logout();location.replace("./login.html");return true;}
      if(command==="@refresh"){state.result={ok:true,status:"connected",updatedAt:new Date().toISOString()};}
      else{const result=await executeAdminCommand(command);if(!result?.ok)throw new Error(result?.error||"Action failed");state.result=result;}
      return true;
    }catch(error){state.error=error?.message||String(error);return false;}
    finally{state.loading=false;render();}
  }
  return Object.freeze({id:config.id,title:config.title,initialize:()=>true,mount(container){state.container=container;render();return true;},refresh(){return state.lastAction?run(state.lastAction):(render(),true);},unmount(){if(state.container)state.container.innerHTML="";state.container=null;return true;},reset(){state.result=null;state.error=null;state.lastAction=null;return true;},snapshot(){return{id:config.id,loading:state.loading,lastAction:state.lastAction,error:state.error};}});
}

const SystemPages=Object.freeze(PAGE_CONFIGS.map(createSystemPage));
export {PAGE_CONFIGS,createSystemPage,SystemPages};
export default SystemPages;
