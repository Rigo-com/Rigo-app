// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================

import Bootstrap from "./bootstrap/index.js";
import applyAdminUIAccess from "./auth/admin-ui-access.js";
import AccountSync from "./storage/account-sync.js";

async function startApplication(){
  const started=await Bootstrap.boot();
  if(started===false){throw new Error("RIGO BOOTSTRAP FAILED");}
  return true;
}

const applicationReady=startApplication()
.then((result)=>{
  // Account data and server-side admin visibility are useful, but neither is
  // required to paint an interactive page. Keep them off the critical path.
  void AccountSync.sync().catch(()=>{});
  void applyAdminUIAccess().catch(()=>{});
  return result;
})
.catch((error)=>{
  console.error("RIGO startup failed:",error);
  if(typeof document!=="undefined"){
    document.body.innerHTML=`<pre>${error?.stack||error}</pre>`;
  }
  throw error;
});

export {startApplication,applicationReady};
export default applicationReady;
