import {executeAdminCommand} from "./admin-agent/admin-agent-loader.js";

const state={container:null,loading:false,error:null,result:null,updatedAt:null};
const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
const list=value=>Array.isArray(value)?value:[];
const number=value=>Number.isFinite(Number(value))?Number(value):0;

function model(){
  const result=state.result||{};
  const analysis=result.analysis||result.diagnostic||result.report?.analysis||{};
  const snapshot=result.snapshot||result.report?.snapshot||{};
  const diagnostics=snapshot.diagnostics||{};
  const runtime=analysis.runtime||snapshot.runtime||{};
  const errors=[...list(result.errors),...list(result.runtimeErrors),...list(diagnostics.errors),...list(runtime.runtimeErrors)];
  const rejections=[...list(result.promiseRejections),...list(runtime.promiseRejections)];
  const crashes=[...list(result.crashes),...list(runtime.crashes)];
  const critical=[...list(result.critical),...list(diagnostics.critical)];
  const errorCount=number(analysis.errors)||(errors.length+rejections.length);
  const warningCount=number(analysis.warnings)||list(diagnostics.warnings).length;
  const criticalCount=number(analysis.critical)||(critical.length+crashes.length);
  const score=Math.max(0,Math.min(100,Number.isFinite(Number(analysis.healthScore))?Number(analysis.healthScore):100-errorCount*10-warningCount*3-criticalCount*20));
  return{score,healthy:analysis.healthy!==false&&errorCount===0&&criticalCount===0,errors:errorCount,warnings:warningCount,critical:criticalCount,rejections:number(runtime.rejections)||rejections.length,crashes:number(runtime.crashes)||crashes.length,circular:number(analysis.circularDependencies),items:[...critical,...crashes,...errors,...rejections]};
}

function renderIssues(items){
  if(!items.length)return`<div class="debug-empty"><span>✓</span><strong>No captured issues</strong><small>Runtime and console are clear.</small></div>`;
  return items.slice(0,50).map((item,index)=>{const value=typeof item==="string"?{message:item}:item||{};return`<article class="debug-issue"><span>${index+1}</span><div><strong>${escapeHTML(value.name||value.type||"Runtime issue")}</strong><p>${escapeHTML(value.message||value.reason||JSON.stringify(value))}</p>${value.stack?`<details><summary>Stack trace</summary><pre>${escapeHTML(value.stack)}</pre></details>`:""}</div></article>`;}).join("");
}

function render(){
  if(!state.container)return false;
  const data=model();
  const status=data.healthy?"Healthy":"Needs attention";
  state.container.innerHTML=`<style>
  .debug-center{min-height:100%;padding:20px 20px 120px;color:#f8fafc;background:#020817;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.debug-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.debug-head h1{margin:0 0 6px;font-size:28px}.debug-head p{margin:0;color:#94a3b8}.debug-live{display:flex;align-items:center;gap:7px;color:#4ade80;font-size:12px;font-weight:800}.debug-live i{width:9px;height:9px;border-radius:50%;background:#34d399;box-shadow:0 0 14px #34d399}.debug-overview{display:grid;grid-template-columns:220px 1fr;gap:14px}.debug-health,.debug-panel,.debug-metric{border:1px solid #22344d;border-radius:18px;background:linear-gradient(145deg,#0c1a2d,#071322);box-shadow:inset 0 1px #ffffff08}.debug-health{display:flex;align-items:center;justify-content:center;gap:20px;padding:22px}.debug-ring{--score:${data.score};width:118px;height:118px;flex:0 0 118px;display:grid;place-items:center;border-radius:50%;background:conic-gradient(#34d399 calc(var(--score)*1%),#17263b 0);position:relative}.debug-ring:after{content:"";position:absolute;inset:11px;border-radius:50%;background:#071322}.debug-ring div{position:relative;z-index:1;text-align:center}.debug-ring strong{display:block;font-size:31px}.debug-ring small{color:#94a3b8}.debug-health-copy strong{display:block;font-size:18px}.debug-health-copy span{display:block;margin-top:6px;color:${data.healthy?'#34d399':'#fb7185'};font-size:12px;font-weight:800}.debug-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.debug-metric{padding:18px}.debug-metric span{display:block;color:#94a3b8;font-size:12px}.debug-metric strong{display:block;margin-top:7px;font-size:27px}.debug-metric.error strong{color:#fb7185}.debug-metric.warn strong{color:#facc15}.debug-metric.critical strong{color:#c084fc}.debug-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.debug-actions button{min-height:48px;border:1px solid #28405d;border-radius:13px;background:#0b192b;color:#e5edf8;font-weight:750;cursor:pointer}.debug-actions button.primary{border-color:#166b58;color:#50e3b1;background:#08251f}.debug-actions button:disabled{opacity:.45}.debug-panel{padding:17px}.debug-panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px}.debug-panel-head h2{margin:0;font-size:17px}.debug-panel-head span{color:#64748b;font-size:11px}.debug-empty{min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.debug-empty span{display:grid;place-items:center;width:48px;height:48px;border:1px solid #145d4c;border-radius:50%;color:#34d399;background:#08241f;font-size:22px}.debug-empty strong{margin-top:12px}.debug-empty small{margin-top:5px;color:#64748b}.debug-error{padding:14px;border:1px solid #7f1d35;border-radius:12px;color:#fda4af;background:#2a0c17}.debug-loading{padding:50px;text-align:center;color:#94a3b8}.debug-issue{display:grid;grid-template-columns:30px 1fr;gap:10px;padding:12px 0;border-top:1px solid #17263b}.debug-issue>span{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;color:#fb7185;background:#2a1020}.debug-issue strong{font-size:13px}.debug-issue p{margin:5px 0;color:#aebbd0;font:12px/1.5 ui-monospace,monospace;overflow-wrap:anywhere}.debug-issue details{color:#64748b;font-size:11px}.debug-issue pre{white-space:pre-wrap;overflow-wrap:anywhere;color:#94a3b8}.debug-runtime{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.debug-runtime .debug-panel{text-align:center}.debug-runtime strong{display:block;font-size:20px}.debug-runtime span{color:#94a3b8;font-size:11px}@media(max-width:760px){.debug-center{padding:18px 16px 125px}.debug-head h1{font-size:25px}.debug-live{display:none}.debug-overview{grid-template-columns:1fr}.debug-health{justify-content:flex-start}.debug-ring{width:105px;height:105px;flex-basis:105px}.debug-metrics{grid-template-columns:repeat(3,1fr)}.debug-metric{padding:13px 10px}.debug-metric strong{font-size:23px}.debug-actions{grid-template-columns:1fr}.debug-runtime{grid-template-columns:repeat(3,1fr)}}
  </style><section class="debug-center"><header class="debug-head"><div><h1>Debug Center</h1><p>Live runtime health and captured application issues.</p></div><div class="debug-live"><i></i>MONITORING</div></header>${state.error?`<div class="debug-error">${escapeHTML(state.error)}</div>`:""}<div class="debug-overview"><section class="debug-health"><div class="debug-ring"><div><strong>${data.score}</strong><small>/ 100</small></div></div><div class="debug-health-copy"><strong>System Health</strong><span>${status}</span></div></section><div class="debug-metrics"><div class="debug-metric error"><span>Errors</span><strong>${data.errors}</strong></div><div class="debug-metric warn"><span>Warnings</span><strong>${data.warnings}</strong></div><div class="debug-metric critical"><span>Critical</span><strong>${data.critical}</strong></div></div></div><div class="debug-actions"><button class="primary" data-debug-command="diagnose system" ${state.loading?'disabled':''}>${state.loading?'Scanning…':'Run Diagnostics'}</button><button data-debug-command="debug report" ${state.loading?'disabled':''}>Generate Report</button><button data-debug-command="list errors" ${state.loading?'disabled':''}>Refresh Errors</button></div><div class="debug-runtime"><div class="debug-panel"><strong>${data.rejections}</strong><span>Promise rejections</span></div><div class="debug-panel"><strong>${data.crashes}</strong><span>Runtime crashes</span></div><div class="debug-panel"><strong>${data.circular}</strong><span>Circular dependencies</span></div></div><section class="debug-panel"><div class="debug-panel-head"><h2>Captured Issues</h2><span>${state.updatedAt?`Updated ${new Date(state.updatedAt).toLocaleTimeString()}`:'Not scanned yet'}</span></div>${state.loading?'<div class="debug-loading">Collecting diagnostics…</div>':renderIssues(data.items)}</section></section>`;
  state.container.querySelectorAll("[data-debug-command]").forEach(button=>button.addEventListener("click",()=>run(button.dataset.debugCommand)));
  return true;
}

async function run(command="diagnose system"){
  if(state.loading)return false;
  state.loading=true;state.error=null;render();
  try{const result=await executeAdminCommand(command);if(!result?.ok)throw new Error(result?.error||"Debug action failed");state.result=result;state.updatedAt=Date.now();return true;}
  catch(error){state.error=error?.message||String(error);return false;}
  finally{state.loading=false;render();}
}

const DebugPage=Object.freeze({id:"debug",title:"Debug Center",initialize:()=>true,async mount(container){state.container=container;render();await run();return true;},refresh:()=>run(),unmount(){if(state.container)state.container.innerHTML="";state.container=null;return true;},reset(){state.error=null;state.result=null;state.updatedAt=null;return true;},snapshot(){return{loading:state.loading,error:state.error,updatedAt:state.updatedAt,health:model()};}});
export {model,run,DebugPage};
export default DebugPage;
