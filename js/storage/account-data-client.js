// =====================================
// RIGO AI
// ACCOUNT DATA CLIENT
// NEON BACKEND SYNC
// =====================================

const ENDPOINT="/api/user-data";
const SECTIONS=Object.freeze(new Set(["chats","memory","settings","preferences"]));

function validSection(section){
  const value=String(section||"").trim().toLowerCase();
  return SECTIONS.has(value)?value:"";
}

async function request(section,{method="GET",data}={}){
  const normalized=validSection(section);
  if(!normalized)throw new Error("INVALID_DATA_SECTION");

  const options={
    method,
    credentials:"same-origin",
    headers:{Accept:"application/json"}
  };

  if(method!=="GET"){
    options.headers["Content-Type"]="application/json";
    options.body=JSON.stringify({section:normalized,data});
  }

  const response=await fetch(`${ENDPOINT}?section=${encodeURIComponent(normalized)}`,options);
  const text=await response.text();
  let payload=null;
  try{payload=text?JSON.parse(text):null}catch{payload=null}

  if(!response.ok){
    throw new Error(payload?.error||`ACCOUNT_DATA_${response.status}`);
  }

  return payload;
}

async function loadAccountSection(section){
  const result=await request(section,{method:"GET"});
  return result?.data??null;
}

async function saveAccountSection(section,data){
  return request(section,{method:"PUT",data});
}

async function removeAccountSection(section){
  return request(section,{method:"DELETE",data:null});
}

const AccountDataClient=Object.freeze({
  load:loadAccountSection,
  save:saveAccountSection,
  remove:removeAccountSection
});

export {
  loadAccountSection,
  saveAccountSection,
  removeAccountSection,
  AccountDataClient
};

export default AccountDataClient;
