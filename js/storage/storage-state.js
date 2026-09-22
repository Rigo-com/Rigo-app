const storageState=Object.seal({
  initialized:false,loading:false,saving:false,flushing:false,healthy:true,activeOperations:0,
  diagnostics:Object.seal({loads:0,saves:0,removals:0,clears:0,failures:0})
});
function createSnapshot(){return{initialized:storageState.initialized,loading:storageState.loading,saving:storageState.saving,flushing:storageState.flushing,healthy:storageState.healthy,activeOperations:storageState.activeOperations,diagnostics:{...storageState.diagnostics}};}
function setInitialized(value){storageState.initialized=Boolean(value);}
function setLoading(value){storageState.loading=Boolean(value);}
function setSaving(value){storageState.saving=Boolean(value);}
function setFlushing(value){storageState.flushing=Boolean(value);}
function setHealthy(value){storageState.healthy=Boolean(value);}
function incrementOperations(){storageState.activeOperations++;}
function decrementOperations(){storageState.activeOperations=Math.max(0,storageState.activeOperations-1);}
function incrementLoads(){storageState.diagnostics.loads++;}
function incrementSaves(){storageState.diagnostics.saves++;}
function incrementRemovals(){storageState.diagnostics.removals++;}
function incrementClears(){storageState.diagnostics.clears++;}
function incrementFailures(){storageState.diagnostics.failures++;}
function getStorageSnapshot(){return Object.freeze(createSnapshot());}
function getStorageDiagnostics(){return Object.freeze({...storageState.diagnostics});}
function resetStorageState(){
  storageState.initialized=false;storageState.loading=false;storageState.saving=false;storageState.flushing=false;storageState.healthy=true;storageState.activeOperations=0;
  Object.keys(storageState.diagnostics).forEach(key=>{storageState.diagnostics[key]=0;});
  return true;
}
const StorageState=Object.freeze({setInitialized,setLoading,setSaving,setFlushing,setHealthy,incrementOperations,decrementOperations,incrementLoads,incrementSaves,incrementRemovals,incrementClears,incrementFailures,snapshot:getStorageSnapshot,diagnostics:getStorageDiagnostics,reset:resetStorageState});
export{storageState,setInitialized,setLoading,setSaving,setFlushing,setHealthy,incrementOperations,decrementOperations,incrementLoads,incrementSaves,incrementRemovals,incrementClears,incrementFailures,getStorageSnapshot,getStorageDiagnostics,resetStorageState,StorageState};
export default StorageState;