import { diagnosticsState } from "./diagnostics-state.js";

const STORAGE_KEY="rigo-diagnostics";

function getStorage(){
  try{
    if(typeof localStorage!=="undefined")return localStorage;
  }catch{}
  return null;
}

function saveDiagnostics(){
  try{
    const storage=getStorage();
    if(!storage)return false;
    const data={
      healthScore:diagnosticsState.healthScore,
      diagnostics:{...diagnosticsState.diagnostics},
      errors:[...diagnosticsState.errors].slice(-100),
      warnings:[...diagnosticsState.warnings].slice(-100),
      criticalIssues:[...diagnosticsState.criticalIssues].slice(-100),
      eventHistory:[...diagnosticsState.eventHistory].slice(-250),
      timestamp:Date.now()
    };
    storage.setItem(STORAGE_KEY,JSON.stringify(data));
    return true;
  }catch{return false;}
}

function loadDiagnostics(){
  try{
    const storage=getStorage();
    if(!storage)return null;
    const raw=storage.getItem(STORAGE_KEY);
    return raw?JSON.parse(raw):null;
  }catch{return null;}
}

function restoreDiagnostics(){
  const saved=loadDiagnostics();
  if(!saved)return false;
  try{
    diagnosticsState.errors.splice(0,diagnosticsState.errors.length,...(saved.errors||[]));
    diagnosticsState.warnings.splice(0,diagnosticsState.warnings.length,...(saved.warnings||[]));
    diagnosticsState.criticalIssues.splice(0,diagnosticsState.criticalIssues.length,...(saved.criticalIssues||[]));
    diagnosticsState.eventHistory.splice(0,diagnosticsState.eventHistory.length,...(saved.eventHistory||[]));
    diagnosticsState.healthScore=Number.isFinite(saved.healthScore)?saved.healthScore:diagnosticsState.healthScore;
    return true;
  }catch{return false;}
}

function clearDiagnostics(){
  try{
    const storage=getStorage();
    if(!storage)return false;
    storage.removeItem(STORAGE_KEY);
    return true;
  }catch{return false;}
}

export {saveDiagnostics,loadDiagnostics,restoreDiagnostics,clearDiagnostics};
export default Object.freeze({saveDiagnostics,loadDiagnostics,restoreDiagnostics,clearDiagnostics});
