// =====================================
// RIGO AI
// STUDIO DASHBOARD STATE
// =====================================

const DashboardState =
Object.seal({

  initialized:
  false,

  loading:
  false,

  error:
  null,

  lastUpdatedAt:
  null,

  data:{

    project:null,

    files:0,

    folders:0,

    systems:0,

    agents:0,

    imports:0,

    exports:0,

    relationships:0,

    github:{

      connected:false,

      status:"unknown"

    },

    memory:{

      available:false,

      status:"unknown"

    },

    debug:{

      available:false,

      status:"unknown"

    }

  }

});



// =====================================
// SETTERS
// =====================================

function setInitialized(
  value
){

  DashboardState.initialized =
  Boolean(value);

  return true;

}



function setLoading(
  value
){

  DashboardState.loading =
  Boolean(value);

  return true;

}



function setError(
  error
){

  DashboardState.error =
  error || null;

  return true;

}



function setData(
  data = {}
){

  DashboardState.data =
  Object.assign(
    {},
    DashboardState.data,
    data
  );

  DashboardState.lastUpdatedAt =
  Date.now();

  return true;

}



function reset(){

  DashboardState.initialized =
  false;

  DashboardState.loading =
  false;

  DashboardState.error =
  null;

  DashboardState.lastUpdatedAt =
  null;

  DashboardState.data = {

    project:null,

    files:0,

    folders:0,

    systems:0,

    agents:0,

    imports:0,

    exports:0,

    relationships:0,

    github:{

      connected:false,

      status:"unknown"

    },

    memory:{

      available:false,

      status:"unknown"

    },

    debug:{

      available:false,

      status:"unknown"

    }

  };

  return true;

}



function snapshot(){

  return JSON.parse(
    JSON.stringify(
      DashboardState
    )
  );

}



// =====================================
// EXPORTS
// =====================================

export {

  DashboardState,

  setInitialized,

  setLoading,

  setError,

  setData,

  reset,

  snapshot

};

export default
DashboardState;
