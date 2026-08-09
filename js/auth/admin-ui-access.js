async function getServerAdminSession(){
  try{
    const response=await fetch("/api/admin-session",{method:"GET",credentials:"same-origin",cache:"no-store"});
    const data=await response.json().catch(()=>({}));
    return Boolean(response.ok&&data?.authenticated&&data?.admin);
  }catch{return false;}
}

async function applyAdminUIAccess(){
  if(typeof document==="undefined")return false;
  const adminButton=document.getElementById("admin");
  const debugButton=document.getElementById("debug");
  if(adminButton)adminButton.hidden=true;
  if(debugButton)debugButton.hidden=true;

  const allowed=await getServerAdminSession();
  if(!allowed)return false;

  if(adminButton){adminButton.hidden=false;adminButton.onclick=()=>{location.href="./admin.html";};}
  if(debugButton){debugButton.hidden=false;debugButton.onclick=()=>{location.href="./debug.html";};}
  return true;
}

export {getServerAdminSession,applyAdminUIAccess};
export default applyAdminUIAccess;
