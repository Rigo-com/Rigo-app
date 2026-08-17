import {executeAdminCommand} from "./admin-agent/admin-agent-loader.js";

const state={container:null,loading:false,error:null,notice:null,lastAction:null,updatedAt:null,repository:null,snapshot:null,view:"overview",query:""};
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
const array=value=>Array.isArray(value)?value:[];
const count=value=>Array.isArray(value)?value.length:Number(value)||0;

function projectData(){return state.snapshot?.result||state.snapshot?.index||state.snapshot||{};}
function metrics(){const data=projectData(),diagnostics=data.diagnostics||{};return{files:count(data.files)||count(diagnostics.files),folders:count(data.folders)||count(diagnostics.folders),systems:count(data.systems)||count(diagnostics.systems),imports:count(data.imports)||count(diagnostics.imports),exports:count(data.exports)||count(diagnostics.exports),ui:count(data.ui)||count(diagnostics.ui),agents:count(data.agents),routes:count(data.routes)||count(diagnostics.routes)};}
function items(){const data=projectData();return state.view==="folders"?array(data.folders):array(data.files);}
function visibleItems(){const query=state.query.trim().toLowerCase();return items().filter(item=>!query||String(item?.path||item?.name||item).toLowerCase().includes(query)).slice(0,250);}
function formatSize(size){const value=Number(size)||0;if(value<1024)return`${value} B`;if(value<1048576)return`${(value/1024).toFixed(1)} KB`;return`${(value/1048576).toFixed(1)} MB`;}

function renderList(){
  const values=visibleItems(),folder=state.view==="folders";
  if(!items().length)return`<div class="project-empty"><span>${folder?'▱':'⌕'}</span><strong>No ${folder?'folders':'files'} loaded</strong><small>Run Scan Project to load repository data.</small></div>`;
  if(!values.length)return`<div class="project-empty"><strong>No matching results</strong><small>Try another search.</small></div>`;
  return`<div class="project-list">${values.map(item=>{const path=String(item?.path||item?.name||item);return`<article class="project-row"><span class="project-row-icon">${folder?'▱':'◫'}</span><div><strong>${esc(item?.name||path.split('/').pop())}</strong><small>${esc(path)}</small></div>${folder?'':`<em>${esc(formatSize(item?.size))}</em>`}</article>`;}).join("")}</div>`;
}

function render(){
  if(!state.container)return false;
  const data=projectData(),stats=metrics(),repo=state.repository||{},ready=Boolean(data.ready||stats.files);
  state.container.innerHTML=`<style>
  .project-center{min-height:100%;padding:20px 20px 120px;color:#f8fafc;background:#020817;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.project-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.project-head h1{margin:0 0 6px;font-size:28px}.project-head p{margin:0;color:#94a3b8}.project-state{display:flex;align-items:center;gap:7px;color:${ready?'#4ade80':'#facc15'};font-size:11px;font-weight:800}.project-state i{width:8px;height:8px;border-radius:50%;background:currentColor;box-shadow:0 0 12px currentColor}.project-repo{display:flex;align-items:center;gap:13px;margin:18px 0 12px;padding:17px;border:1px solid #263852;border-radius:17px;background:linear-gradient(145deg,#0c1a2d,#071322)}.project-repo-icon{display:grid;place-items:center;width:48px;height:48px;border:1px solid #155e4b;border-radius:14px;color:#5ee8b5;background:#08251f;font-size:22px}.project-repo div{min-width:0}.project-repo strong,.project-repo span{display:block}.project-repo strong{font-size:16px}.project-repo span{margin-top:4px;color:#94a3b8;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.project-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:12px 0}.project-actions button{min-height:46px;padding:8px;border:1px solid #28405d;border-radius:12px;color:#dce7f5;background:#0b192b;font-weight:700;cursor:pointer}.project-actions button.primary{border-color:#166b58;color:#5ee8b5;background:#08251f}.project-actions button[data-active="true"]{border-color:#2dd4bf;color:#5ee8b5}.project-actions button:disabled{opacity:.45}.project-notice,.project-error{margin:12px 0;padding:11px 13px;border-radius:11px;font-size:12px;font-weight:700}.project-notice{border:1px solid #155e4b;color:#6ee7b7;background:#06241d}.project-notice.loading{border-color:#1e4e73;color:#7dd3fc;background:#071d30}.project-error{border:1px solid #7f1d35;color:#fda4af;background:#2a0c17}.project-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:12px 0}.project-metric{padding:15px;border:1px solid #22344d;border-radius:14px;background:#091729}.project-metric strong,.project-metric span{display:block}.project-metric strong{font-size:23px}.project-metric span{margin-top:5px;color:#94a3b8;font-size:10px}.project-panel{padding:15px;border:1px solid #22344d;border-radius:17px;background:#071322}.project-panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.project-panel-head h2{margin:0;font-size:17px}.project-search{min-width:0;width:230px;padding:9px 11px;border:1px solid #2a3d58;border-radius:10px;outline:none;color:#f8fafc;background:#091728}.project-list{max-height:52vh;overflow:auto}.project-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;align-items:center;gap:10px;padding:11px 3px;border-top:1px solid #17263b}.project-row-icon{display:grid;place-items:center;width:31px;height:31px;border-radius:9px;color:#60a5fa;background:#0d2744}.project-row div{min-width:0}.project-row strong,.project-row small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.project-row strong{font-size:12px}.project-row small{margin-top:3px;color:#64748b;font-size:10px}.project-row em{color:#94a3b8;font-size:10px;font-style:normal}.project-empty{min-height:190px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.project-empty>span{font-size:30px;color:#34d399}.project-empty strong{margin-top:9px}.project-empty small{margin-top:5px;color:#64748b}@media(max-width:760px){.project-center{padding:18px 16px 125px}.project-head h1{font-size:25px}.project-state{display:none}.project-actions{grid-template-columns:1fr 1fr}.project-metrics{grid-template-columns:repeat(2,1fr)}.project-panel-head{align-items:flex-start;flex-direction:column}.project-search{width:100%}.project-list{max-height:48vh}}
  </style><section class="project-center"><header class="project-head"><div><h1>Project</h1><p>Repository structure and live project intelligence.</p></div><div class="project-state"><i></i>${ready?'PROJECT READY':'SCAN REQUIRED'}</div></header><section class="project-repo"><span class="project-repo-icon">⌘</span><div><strong>${esc(repo.owner&&repo.repo?`${repo.owner} / ${repo.repo}`:'RIGO Project')}</strong><span>${esc(repo.branch?`Branch: ${repo.branch} · Root: ${repo.root||'js'}`:'Run a scan to connect repository details')}</span></div></section><div class="project-actions"><button class="primary" data-project-action="scan project" ${state.loading?'disabled':''}>${state.loading&&state.lastAction==='scan project'?'Scanning…':'Scan Project'}</button><button data-project-action="project snapshot" ${state.loading?'disabled':''}>Snapshot</button><button data-project-action="list files" data-active="${state.view==='files'}" ${state.loading?'disabled':''}>Files</button><button data-project-action="list folders" data-active="${state.view==='folders'}" ${state.loading?'disabled':''}>Folders</button></div>${state.error?`<div class="project-error">${esc(state.error)}</div>`:state.notice?`<div class="project-notice ${state.loading?'loading':''}">${state.loading?'◌':'✓'} ${esc(state.notice)}</div>`:""}<div class="project-metrics"><div class="project-metric"><strong>${stats.files}</strong><span>FILES</span></div><div class="project-metric"><strong>${stats.folders}</strong><span>FOLDERS</span></div><div class="project-metric"><strong>${stats.systems}</strong><span>SYSTEMS</span></div><div class="project-metric"><strong>${stats.imports}</strong><span>IMPORTS</span></div><div class="project-metric"><strong>${stats.exports}</strong><span>EXPORTS</span></div><div class="project-metric"><strong>${stats.ui}</strong><span>UI MODULES</span></div><div class="project-metric"><strong>${stats.agents}</strong><span>AGENTS</span></div><div class="project-metric"><strong>${stats.routes}</strong><span>ROUTES</span></div></div><section class="project-panel"><div class="project-panel-head"><h2>${state.view==='folders'?'Project Folders':'Project Files'}</h2><input class="project-search" type="search" value="${esc(state.query)}" placeholder="Search ${state.view}…" data-project-search></div>${state.loading?'<div class="project-empty"><strong>Loading project data…</strong></div>':renderList()}</section></section>`;
  state.container.querySelectorAll("[data-project-action]").forEach(button=>button.addEventListener("click",()=>handleAction(button.dataset.projectAction)));
  state.container.querySelector("[data-project-search]")?.addEventListener("input",event=>{state.query=event.target.value;render();const input=state.container?.querySelector("[data-project-search]");input?.focus();input?.setSelectionRange(state.query.length,state.query.length);});
  return true;
}

function scrollTo(selector){
  requestAnimationFrame(()=>state.container?.querySelector(selector)?.scrollIntoView({behavior:"smooth",block:"start"}));
}

async function handleAction(command){
  if(command==="list files"&&array(projectData().files).length){state.view="files";state.query="";state.notice="Showing project files.";render();scrollTo(".project-panel");return true;}
  if(command==="list folders"&&array(projectData().folders).length){state.view="folders";state.query="";state.notice="Showing project folders.";render();scrollTo(".project-panel");return true;}
  const result=await run(command);
  if(result&&command==="project snapshot")scrollTo(".project-metrics");
  else if(result&&(command==="list files"||command==="list folders"))scrollTo(".project-panel");
  return result;
}

async function run(command="project snapshot"){
  if(state.loading)return false;
  state.loading=true;state.error=null;state.lastAction=command;state.notice=command==="scan project"?"Scanning the repository and analyzing source files…":"Loading project data…";render();
  try{
    const result=await executeAdminCommand(command);if(!result?.ok)throw new Error(result?.error||"Project action failed");
    if(command==="scan project"){state.repository={owner:result.owner,repo:result.repo,branch:result.branch,root:result.root};state.snapshot=result.index||result;state.view="files";}
    else if(command==="project snapshot")state.snapshot=result;
    else if(command==="list files"){const data=projectData();state.snapshot={...data,files:result.result||[]};state.view="files";}
    else if(command==="list folders"){const data=projectData();state.snapshot={...data,folders:result.result||[]};state.view="folders";}
    state.updatedAt=Date.now();state.notice=command==="scan project"?"Project scan completed.":command==="project snapshot"?"Project snapshot refreshed.":command==="list files"?"Showing project files.":"Showing project folders.";return true;
  }catch(error){state.error=error?.message||String(error);state.notice=null;return false;}
  finally{state.loading=false;render();}
}

const ProjectPage=Object.freeze({id:"project",title:"Project",initialize:()=>true,async mount(container){state.container=container;render();await run("project snapshot");return true;},refresh:()=>run("project snapshot"),unmount(){if(state.container)state.container.innerHTML="";state.container=null;return true;},reset(){state.error=null;state.notice=null;state.snapshot=null;state.repository=null;state.query="";return true;},snapshot(){return{loading:state.loading,error:state.error,view:state.view,updatedAt:state.updatedAt,metrics:metrics()};}});
export {metrics,handleAction,run,ProjectPage};
export default ProjectPage;
