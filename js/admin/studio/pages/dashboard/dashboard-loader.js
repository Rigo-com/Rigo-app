// =====================================
// RIGO AI
// STUDIO DASHBOARD LOADER
// =====================================

import {
  setLoading,
  setError,
  setData
}
from "./dashboard-state.js";



// =====================================
// SAFE ACCESS
// =====================================

function getAdmin(){

  return window?.Admin || null;

}



function getProjectAgent(){

  const admin =
  getAdmin();

  return (
    admin?.ProjectAgent ||
    admin?.projectAgent ||
    null
  );

}



function getProjectIndex(){

  const projectAgent =
  getProjectAgent();

  return (
    projectAgent?.ProjectIndex ||
    projectAgent?.index ||
    projectAgent?.state?.index ||
    null
  );

}



function getDebugSystem(){

  const admin =
  getAdmin();

  return (
    admin?.Debug ||
    admin?.debug ||
    window?.Debug ||
    null
  );

}



function getMemorySystem(){

  const admin =
  getAdmin();

  return (
    admin?.Memory ||
    admin?.memory ||
    window?.Memory ||
    null
  );

}



// =====================================
// NORMALIZERS
// =====================================

function countValue(
  value
){

  if(
    Array.isArray(value)
  ){

    return value.length;

  }

  if(
    value &&
    typeof value === "object"
  ){

    return Object.keys(value).length;

  }

  if(
    typeof value === "number"
  ){

    return value;

  }

  return 0;

}



function normalizeProjectIndex(
  projectIndex
){

  if(
    !projectIndex
  ){

    return {

      project:null,

      files:0,

      folders:0,

      systems:0,

      agents:0,

      imports:0,

      exports:0,

      relationships:0

    };

  }

  const snapshot =
  typeof projectIndex.snapshot === "function"
  ? projectIndex.snapshot()
  : projectIndex;

  return {

    project:
    snapshot?.project ||
    snapshot?.repository ||
    null,

    files:
    countValue(
      snapshot?.files
    ),

    folders:
    countValue(
      snapshot?.folders
    ),

    systems:
    countValue(
      snapshot?.systems
    ),

    agents:
    countValue(
      snapshot?.agents
    ),

    imports:
    countValue(
      snapshot?.imports
    ),

    exports:
    countValue(
      snapshot?.exports
    ),

    relationships:
    countValue(
      snapshot?.relationships ||
      snapshot?.graph
    )

  };

}



function normalizeStatus(
  system
){

  if(
    !system
  ){

    return {

      available:false,

      status:"missing"

    };

  }

  if(
    typeof system.snapshot === "function"
  ){

    const snapshot =
    system.snapshot();

    return {

      available:true,

      status:
      snapshot?.status ||
      snapshot?.health ||
      "available"

    };

  }

  return {

    available:true,

    status:"available"

  };

}



// =====================================
// LOAD
// =====================================

async function loadDashboardData(){

  setLoading(
    true
  );

  setError(
    null
  );

  try{

    const admin =
    getAdmin();

    const projectAgent =
    getProjectAgent();

    const projectIndex =
    getProjectIndex();

    const debugSystem =
    getDebugSystem();

    const memorySystem =
    getMemorySystem();

    const projectData =
    normalizeProjectIndex(
      projectIndex
    );

    const githubConnected =
    Boolean(
      projectAgent &&
      projectData.files > 0
    );

    const data = {

      ...projectData,

      github:{

        connected:
        githubConnected,

        status:
        githubConnected
        ? "connected"
        : admin
          ? "waiting-for-scan"
          : "admin-missing"

      },

      debug:
      normalizeStatus(
        debugSystem
      ),

      memory:
      normalizeStatus(
        memorySystem
      )

    };

    setData(
      data
    );

    setLoading(
      false
    );

    return data;

  }
  catch(error){

    setError(
      error
    );

    setLoading(
      false
    );

    return null;

  }

}



// =====================================
// EXPORTS
// =====================================

export {

  loadDashboardData,

  getAdmin,

  getProjectAgent,

  getProjectIndex,

  getDebugSystem,

  getMemorySystem

};

export default
loadDashboardData;
