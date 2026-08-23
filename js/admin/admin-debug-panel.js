// =====================================
// RIGO AI
// ADMIN DEBUG PANEL
// UNIFIED ADMIN-ONLY DEBUG UI
// =====================================

async function createAdminDebugPanel(Admin){
  if(typeof document === "undefined") return false;
  if(document.getElementById("rigo-admin-debug-panel")) return true;

  const panel=document.createElement("div");
  panel.id="rigo-admin-debug-panel";
  panel.style.cssText=`position:fixed;inset:12px;z-index:999999;background:#050914;color:#fff;border:1px solid #1f2937;border-radius:16px;padding:12px;font-family:monospace;display:flex;flex-direction:column;gap:10px;`;
  panel.innerHTML=`
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
      <div style="font-weight:700;font-size:16px;">RIGO Admin Debug</div>
      <div id="rigo-admin-debug-status" style="font-size:12px;color:#94a3b8;">Loading...</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button data-debug="capture">Live Status</button>
      <button data-debug="scan">Deep Audit</button>
      <button data-debug="errors">Errors</button>
      <button data-debug="report">Report</button>
      <button data-debug="snapshot">Agent State</button>
      <button data-command="clear">Clear</button>
      <button data-command="close">Close</button>
    </div>
    <pre id="rigo-admin-debug-output" style="flex:1;overflow:auto;background:#020617;color:#d1fae5;border:1px solid #334155;border-radius:10px;padding:10px;white-space:pre-wrap;font-size:12px;">Loading unified debug snapshot...</pre>
  `;
  document.body.appendChild(panel);

  const output=panel.querySelector("#rigo-admin-debug-output");
  const status=panel.querySelector("#rigo-admin-debug-status");

  async function runDebug(action){
    try{
      output.textContent="Running...";
      const result=await Admin.debug(action);
      const analysis=result?.analysis || result?.diagnostic || result?.snapshot?.lastReport || null;
      const healthy=analysis?.healthy;
      status.textContent=healthy===true?"HEALTHY":healthy===false?"ISSUES FOUND":String(result?.mode||action).toUpperCase();
      output.textContent=JSON.stringify(result,null,2);
      return result;
    }catch(error){
      status.textContent="ERROR";
      output.textContent=error?.stack||error?.message||String(error);
      return null;
    }
  }

  panel.addEventListener("click",async event=>{
    const button=event.target.closest("button");
    if(!button)return;
    const command=button.dataset.command;
    if(command==="close"){panel.remove();return;}
    if(command==="clear"){output.textContent="";return;}
    const action=button.dataset.debug;
    if(action) await runDebug(action);
  });

  await runDebug("capture");
  return true;
}

export { createAdminDebugPanel };
export default createAdminDebugPanel;
