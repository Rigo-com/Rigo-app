import { setLoading, setError, setData } from "./dashboard-state.js";

function getAdmin(){return typeof window!=="undefined"?(window.Admin||null):null;}
function getAdminAgent(){
  const admin=getAdmin();
  return admin?.runtime?.registry?.get?.("admin-agent")||admin?.adminAgent||null;
}
function getProjectAgent(){
  const agent=getAdminAgent();
  const snapshot=typeof agent?.snapshot==="function"?agent.snapshot():null;
  return snapshot?.privateSubagents?.project||null;
}
function getProjectIndex(){return getProjectAgent()?.index||null;}
function count(value){if(Array.isArray(value))return value.length;if(value&&typeof value==="object")return Object.keys(value).length;if(typeof value==="number")return value;return 0;}
function normalizeProjectIndex(index){
  if(!index)return{project:null,files:0,folders:0,systems:0,agents:0,imports:0,exports:0,relationships:0};
  return{
    project:index.project||index.repository||null,
    files:count(index.files),folders:count(index.folders),systems:count(index.systems),
    agents:count(index.agents),imports:count(index.imports),exports:count(index.exports),
    relationships:count(index.relationships)
  };
}
function normalizeStatus(system){if(!system)return{available:false,status:"missing"};const snapshot=typeof system.snapshot==="function"?system.snapshot():system;return{available:true,status:snapshot?.status||snapshot?.health||"available"};}
async function loadDashboardData(){
  setLoading(true);setError(null);
  try{
    const admin=getAdmin(),agent=getAdminAgent(),projectAgent=getProjectAgent(),projectData=normalizeProjectIndex(getProjectIndex());
    const adminSnapshot=typeof agent?.snapshot==="function"?agent.snapshot():null;
    const github=adminSnapshot?.providers?.github||null;
    const data={...projectData,github:{connected:Boolean(github?.lastScanAt&&projectData.files>0),status:github?.lastError?"error":github?.lastScanAt?"connected":admin?"waiting-for-scan":"admin-missing"},debug:normalizeStatus(admin?.debug),memory:normalizeStatus(admin?.memory),projectReady:Boolean(projectAgent?.index?.ready)};
    setData(data);setLoading(false);return data;
  }catch(error){setError(error);setLoading(false);return null;}
}
export { loadDashboardData, getAdmin, getAdminAgent, getProjectAgent, getProjectIndex, normalizeProjectIndex, normalizeStatus };
export default loadDashboardData;
