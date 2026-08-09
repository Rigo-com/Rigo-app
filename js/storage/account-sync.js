// =====================================
// RIGO AI
// ACCOUNT DATA SYNC
// SERVER SOURCE + LOCAL CACHE
// =====================================

import {authRuntimeState} from "../auth/auth-state.js";
import {loadAccountSection,saveAccountSection} from "./account-data-client.js";
import {loadMemories,saveMemories} from "../memory/memory-storage.js";
import {MemoryCore} from "../memory/memory-core.js";
import {loadSettings,saveSettings,getStorageStatus} from "../settings/settings-storage.js";
import SettingsManager from "../settings/settings-manager.js";

async function syncMemory(){
  try{
    const remote=await loadAccountSection("memory");

    if(Array.isArray(remote)){
      saveMemories(remote);
      MemoryCore.reload();
      return true;
    }

    const local=loadMemories();
    if(local.length){
      await saveAccountSection("memory",local);
    }

    return true;
  }
  catch{
    return false;
  }
}

async function syncSettings(){
  try{
    const remote=await loadAccountSection("settings");

    if(remote&&typeof remote==="object"&&!Array.isArray(remote)){
      saveSettings(remote);
      SettingsManager.load();
      return true;
    }

    const status=getStorageStatus();
    if(status.hasSettings){
      await saveAccountSection("settings",loadSettings());
    }

    return true;
  }
  catch{
    return false;
  }
}

async function syncAccountData(){
  if(typeof window==="undefined")return false;
  if(!authRuntimeState.authenticated||!authRuntimeState.user?.id)return false;

  const [memory,settings]=await Promise.all([
    syncMemory(),
    syncSettings()
  ]);

  return Boolean(memory&&settings);
}

const AccountSync=Object.freeze({
  sync:syncAccountData,
  memory:syncMemory,
  settings:syncSettings
});

export {syncAccountData,syncMemory,syncSettings,AccountSync};
export default AccountSync;
